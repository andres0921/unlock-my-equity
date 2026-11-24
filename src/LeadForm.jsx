import { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import {
  CONTACT_ENDPOINT,
  INELIGIBLE_STATES,
  NMLS_CONSUMER_ACCESS_LINK,
  PHONE,
  PREAPPROVAL_LINK,
  STATES,
} from "./site";
import { Icon } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = ["name", "email", "phone", "state", "company"];

function readFields(formEl) {
  const data = new FormData(formEl);
  return Object.fromEntries(FIELDS.map((k) => [k, String(data.get(k) ?? "")]));
}

// Keep whichever value is non-empty, preferring what's in the field.
function mergeTyped(state, typed) {
  const out = { ...state };
  for (const k of FIELDS) if (typed[k]) out[k] = typed[k];
  return out;
}

/**
 * Two-step HELOC request form.
 *   Step 1: the property state, with "Continue" and an "Estimate first" link.
 *   Step 2: name, email, phone, then the consent text beside Submit.
 *
 * Both steps are always in the DOM (the inactive one is `hidden`), so every
 * field is part of the same <form> at submit time and answers survive going
 * back, or leaving for the calculator and returning. Sends the visitor's
 * details (plus their calculator estimate, if they ran one) to Andres's lead
 * inbox, then offers the pre-approval link. Nothing is sent until Submit.
 *
 * `propertyState` / `onPropertyStateChange` make the property state controlled,
 * so the home page can share one canonical value between this form and the
 * calculator (they can never disagree). Without them the form keeps its own.
 * `ref` exposes `showContact()` so the calculator can bring the visitor back
 * to the right step with their estimate attached.
 */
export function LeadForm({
  estimate,
  propertyState,
  onPropertyStateChange,
  calculatorHref = "#calculator",
  headingLevel = 2,
  ref,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    company: "", // honeypot: real visitors never see or fill this
  });
  const [step, setStep] = useState(1);
  const [focusTick, setFocusTick] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | fallback | error
  const [errors, setErrors] = useState({});
  // The prerendered submit button stays disabled until React has hydrated, so
  // the browser can never fall back to a native submission.
  const [ready, setReady] = useState(false);

  const formRef = useRef(null);
  const doneRef = useRef(null);
  const stateRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const step1HeadingRef = useRef(null);
  const step2HeadingRef = useRef(null);
  // Set once the visitor has moved between steps; enables focus moves and the fade.
  const [moved, setMoved] = useState(false);
  const uid = useId();
  const id = (k) => `${uid}-${k}`;
  const Heading = `h${headingLevel}`;

  const controlled = propertyState !== undefined;
  const stateValue = controlled ? propertyState : form.state;
  const setStateValue = (value) => {
    if (controlled) onPropertyStateChange?.(value);
    else setForm((f) => ({ ...f, state: value }));
  };
  const stateIneligible = INELIGIBLE_STATES.includes(stateValue);
  const hasEstimate = Boolean(estimate?.estimatedLine);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  // The page is pre-rendered, so a visitor on a slow connection can start
  // answering before the app loads. Pick up anything already in the fields so
  // it isn't lost or ignored.
  useEffect(() => {
    const el = formRef.current;
    if (el) {
      const typed = readFields(el);
      if (Object.values(typed).some(Boolean)) {
        setForm((f) => mergeTyped(f, typed));
        if (typed.state && controlled) onPropertyStateChange?.(typed.state);
      }
    }
    setReady(true);
    // Runs once on hydration only; the props it reads are stable for that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the new step's heading after Continue / Back.
  useEffect(() => {
    if (moved) (step === 1 ? step1HeadingRef : step2HeadingRef).current?.focus();
  }, [moved, step, focusTick]);

  // Move focus to the confirmation so keyboard and screen reader users land on it.
  useEffect(() => {
    if (status === "sent" || status === "fallback") doneRef.current?.focus();
  }, [status]);

  function goTo(n) {
    setMoved(true);
    setStep(n);
    setFocusTick((t) => t + 1);
  }

  useImperativeHandle(
    ref,
    () => ({
      // Jump to contact details if we already know the state, else ask for it.
      showContact() {
        goTo(stateValue ? 2 : 1);
      },
    }),
    [stateValue]
  );

  function onStateSelect(e) {
    setStateValue(e.target.value);
  }

  // Property state is optional, as on main: Continue always advances.
  function onContinue() {
    if (!ready) return;
    setErrors({});
    goTo(2);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (step === 1) {
      onContinue();
      return;
    }
    // What's on screen is the source of truth.
    const values = mergeTyped(form, readFields(e.currentTarget));
    setForm(values);
    values.state = stateValue || values.state;
    const next = {};
    if (!values.name.trim()) next.name = "Enter your full name.";
    if (!EMAIL_RE.test(values.email.trim())) {
      next.email = values.email.trim()
        ? "Enter a complete email, like name@example.com."
        : "Enter your email address.";
    }
    if (next.name || next.email) {
      setErrors(next);
      (next.name ? nameRef : emailRef).current?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");

    const details = [
      { label: "Property state", value: values.state },
      { label: "Source", value: "unlockmyequityusa.com" },
    ];
    if (estimate?.estimatedLine) {
      details.push(
        { label: "Est. home value", value: estimate.homeValue },
        { label: "Mortgage owed", value: estimate.mortgageOwed },
        { label: "Est. HELOC amount", value: estimate.estimatedLine },
        { label: "Property type", value: estimate.propertyTypeLabel },
        { label: "Credit range", value: estimate.creditRange }
      );
    }

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          interest: "HELOC (Unlock My Equity USA)",
          details: details.filter((d) => d.value),
          company: values.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "send failed");
      setStatus(data.delivered === false ? "fallback" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent" || status === "fallback") {
    return (
      <div className="lead-form form-success" role="status">
        <div className="success-badge" aria-hidden="true">
          <Icon name="check" size={28} />
        </div>
        <Heading ref={doneRef} tabIndex={-1} className="step-title">
          Thanks, {form.name.trim().split(" ")[0]}. I've got you.
        </Heading>
        <p>
          {status === "sent"
            ? "I'll reach out shortly to talk through your options. No pressure at all."
            : `Your details came through. If you don't hear from me soon, call or text ${PHONE.display}.`}
        </p>
        {!stateIneligible && (
          <>
            <p>Want to see your HELOC options right now?</p>
            <a className="btn btn-primary btn-block" href={PREAPPROVAL_LINK}>
              Check My HELOC Options
              <Icon name="external" size={18} />
            </a>
            <p className="form-note">Opens the lender's site.</p>
          </>
        )}
      </div>
    );
  }

  const fieldError = (key) =>
    errors[key] ? (
      <span className="field-error" id={id(`${key}-error`)}>
        <Icon name="alert" size={16} />
        {errors[key]}
      </span>
    ) : null;

  return (
    <form
      ref={formRef}
      className={`lead-form ${moved ? "has-moved" : ""}`}
      method="post"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="step-meter" aria-hidden="true">
        <span className="is-on" />
        <span className={step === 2 ? "is-on" : ""} />
      </div>

      {/* ---------- Step 1: the property ---------- */}
      <div className="lead-step" hidden={step !== 1}>
        <p className="step-count">Step 1 of 2</p>
        <Heading ref={step1HeadingRef} tabIndex={-1} className="step-title">
          Where is the home you'd borrow against?
        </Heading>

        <div className="field">
          <label htmlFor={id("state")}>
            Property state <span className="opt">Optional</span>
          </label>
          <div className="select-wrap">
            <select
              id={id("state")}
              ref={stateRef}
              name="state"
              autoComplete="address-level1"
              value={stateValue}
              onChange={onStateSelect}
            >
              <option value="">Select a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite">
          {stateIneligible && (
            <p className="notice notice-warn">
              <Icon name="alert" size={18} />
              <span>Properties in {stateValue} don't qualify through this site.</span>
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={onContinue}
          disabled={!ready}
        >
          Continue
          <Icon name="arrowRight" size={18} />
        </button>
        <a className="estimate-link" href={calculatorHref}>
          <span className="estimate-link-main">
            Estimate first
            <Icon name="arrowDown" size={18} />
          </span>
          <span className="estimate-link-sub">See an illustrative number, then come back</span>
        </a>
      </div>

      {/* ---------- Step 2: contact details ---------- */}
      <div className="lead-step" hidden={step !== 2}>
        <p className="step-count">Step 2 of 2</p>
        <Heading ref={step2HeadingRef} tabIndex={-1} className="step-title">
          Where should Andres reach you?
        </Heading>

        <div className="recap">
          <span className="recap-item">
            <Icon name="pin" size={18} />
            {stateValue || "State not chosen"}
          </span>
          <button type="button" className="btn-text" onClick={() => goTo(1)}>
            <Icon name="arrowLeft" size={16} />
            Change<span className="sr-only"> property state</span>
          </button>
        </div>

        {hasEstimate && (
          <p className="estimate-chip">
            <Icon name="check" size={18} />
            <span>
              Illustrative estimate ({estimate.estimatedLine}) from the calculator will
              be included.
            </span>
          </p>
        )}

        <div className={`field ${errors.name ? "has-error" : ""}`}>
          <label htmlFor={id("name")}>Full name</label>
          {fieldError("name")}
          <input
            id={id("name")}
            type="text"
            name="name"
            autoComplete="name"
            ref={nameRef}
            value={form.name}
            onChange={update("name")}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? id("name-error") : undefined}
          />
        </div>
        <div className={`field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor={id("email")}>Email</label>
          {fieldError("email")}
          <input
            id={id("email")}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            ref={emailRef}
            value={form.email}
            onChange={update("email")}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? id("email-error") : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor={id("phone")}>
            Phone <span className="opt">Optional</span>
          </label>
          <input
            id={id("phone")}
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={update("phone")}
          />
        </div>

        <div className="form-status" role="status" aria-live="polite">
          {status === "error" && (
            <p className="notice notice-warn">
              <Icon name="alert" size={18} />
              <span>
                Something went wrong sending that. Please call or text {PHONE.display}
                {stateIneligible ? "." : ", or use the pre-approval link below."}
              </span>
            </p>
          )}
          {status === "sending" && <span className="sr-only">Sending your request.</span>}
        </div>

        <div className="submit-row">
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={!ready || status === "sending"}
            aria-describedby={id("consent")}
          >
            {status === "sending" ? "Sending..." : "Talk Through My Options"}
          </button>
          <p className="secure-note">
            <Icon name="lock" size={16} />
            Your information is sent securely.
          </p>
          <p className="form-note consent" id={id("consent")}>
            By submitting, you agree that Andres Aviles (NEXA Mortgage, NMLS #2640511) may
            contact you by phone, text, or email about your request, including by automated
            means. Consent is not a condition of any loan. Message and data rates may apply.
            Reply STOP to opt out of texts.
          </p>
        </div>

        <p className="form-who">
          <Icon name="shield" size={18} />
          <span>
            Goes to Andres Aviles, Mortgage Loan Officer, NEXA Mortgage (NMLS #2640511).{" "}
            <a href={NMLS_CONSUMER_ACCESS_LINK} target="_blank" rel="noreferrer">
              Verify on NMLS Consumer Access
            </a>
            . Equal Housing Opportunity.
          </span>
        </p>

        {!stateIneligible && (
          <p className="form-alt">
            Rather go straight to your options?{" "}
            <a href={PREAPPROVAL_LINK}>Get pre-approved online</a>
            <span className="form-alt-sub"> (opens the lender's site)</span>
          </p>
        )}
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hp-field"
        value={form.company}
        onChange={update("company")}
      />
    </form>
  );
}
