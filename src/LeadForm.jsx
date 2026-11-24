import { useEffect, useId, useRef, useState } from "react";
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
 * Follow-up request form. Sends the visitor's details (plus their calculator
 * estimate, if they ran one) to Andres's lead inbox, then offers the
 * pre-approval link. Nothing is sent until they press Submit.
 *
 * `suggestedState` pre-fills the property state from the calculator until the
 * visitor picks one themselves.
 */
export function LeadForm({ estimate, suggestedState = "" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    company: "", // honeypot: real visitors never see or fill this
  });
  const [stateTouched, setStateTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | fallback | error
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  // The prerendered submit button stays disabled until React has hydrated, so
  // the browser can never fall back to a native submission.
  const [ready, setReady] = useState(false);

  const formRef = useRef(null);
  const doneRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const uid = useId();
  const id = (k) => `${uid}-${k}`;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const stateValue = stateTouched ? form.state : form.state || suggestedState || "";
  const nameInvalid = showErrors && !form.name.trim();
  const emailInvalid = showErrors && !EMAIL_RE.test(form.email.trim());
  const stateIneligible = INELIGIBLE_STATES.includes(stateValue);

  // The page is pre-rendered, so a visitor on a slow connection can start
  // typing before the app loads. Pick up anything already in the fields so it
  // isn't lost or ignored.
  useEffect(() => {
    const el = formRef.current;
    if (el) {
      const typed = readFields(el);
      if (Object.values(typed).some(Boolean)) {
        setForm((f) => mergeTyped(f, typed));
        if (typed.state) setStateTouched(true);
      }
    }
    setReady(true);
  }, []);

  // Move focus to the confirmation so keyboard and screen reader users land on it.
  useEffect(() => {
    if (status === "sent" || status === "fallback") doneRef.current?.focus();
  }, [status]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    // What's on screen is the source of truth.
    const values = mergeTyped(form, readFields(e.currentTarget));
    setForm(values);
    const missingName = !values.name.trim();
    const badEmail = !EMAIL_RE.test(values.email.trim());
    if (missingName || badEmail) {
      setShowErrors(true);
      setError(
        missingName && badEmail
          ? "Please add your name and a valid email."
          : missingName
            ? "Please add your name."
            : "Please add a valid email."
      );
      (missingName ? nameRef : emailRef).current?.focus();
      return;
    }
    setShowErrors(false);
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
      <div className="lead-done" role="status">
        <span className="lead-done-mark" aria-hidden="true">
          <Icon name="check" size={24} />
        </span>
        <h3 ref={doneRef} tabIndex={-1}>
          Thanks, {form.name.trim().split(" ")[0]}. I've got you.
        </h3>
        <p>
          {status === "sent"
            ? "I'll reach out shortly to talk through your options. No pressure at all."
            : `Your details came through. If you don't hear from me soon, call or text ${PHONE.display}.`}
        </p>
        {!stateIneligible && (
          <>
            <p>Want to see your HELOC options right now?</p>
            <a className="btn btn-primary btn-block" href={PREAPPROVAL_LINK}>
              Check my HELOC options
              <Icon name="external" size={18} />
              <span className="sr-only"> (opens the lender's site)</span>
            </a>
          </>
        )}
      </div>
    );
  }

  const errorIds = (invalid) => (invalid ? id("error") : undefined);

  return (
    <form
      ref={formRef}
      className="lead-form"
      method="post"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={id("who")}
    >
      <div className="lead-grid">
        <div className="field">
          <label htmlFor={id("name")}>
            Full name <span className="req">Required</span>
          </label>
          <input
            id={id("name")}
            type="text"
            name="name"
            autoComplete="name"
            ref={nameRef}
            value={form.name}
            onChange={update("name")}
            required
            aria-invalid={nameInvalid || undefined}
            aria-describedby={errorIds(nameInvalid)}
          />
        </div>
        <div className="field">
          <label htmlFor={id("email")}>
            Email <span className="req">Required</span>
          </label>
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
            aria-invalid={emailInvalid || undefined}
            aria-describedby={errorIds(emailInvalid)}
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
        <div className="field">
          <label htmlFor={id("state")}>
            Property state <span className="opt">Optional</span>
          </label>
          <div className="select">
            <select
              id={id("state")}
              name="state"
              autoComplete="address-level1"
              value={stateValue}
              onChange={(e) => {
                setStateTouched(true);
                setForm((f) => ({ ...f, state: e.target.value }));
              }}
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

      <div className="lead-status" role="status" aria-live="polite">
        {stateIneligible && (
          <p className="notice notice-error">
            <Icon name="alert" size={18} />
            <span>
              Properties in {stateValue} don't qualify through this site.
            </span>
          </p>
        )}
        {error && (
          <p className="notice notice-error" id={id("error")}>
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </p>
        )}
        {status === "error" && (
          <p className="notice notice-error">
            <Icon name="alert" size={18} />
            <span>
              Something went wrong sending that. Please call or text {PHONE.display}
              {stateIneligible ? "." : ", or use the pre-approval link below."}
            </span>
          </p>
        )}
        {status === "sending" && <span className="sr-only">Sending your request.</span>}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={!ready || status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Talk through my options"}
        {status !== "sending" && <Icon name="arrowRight" size={18} />}
      </button>

      <p className="fine consent">
        By submitting, you agree that Andres Aviles (NEXA Mortgage, NMLS #2640511) may
        contact you by phone, text, or email about your request, including by automated
        means. Consent is not a condition of any loan. Message and data rates may apply.
        Reply STOP to opt out of texts.
      </p>

      <p className="lead-who" id={id("who")}>
        <Icon name="shield" size={18} />
        <span>
          Your request goes to Andres Aviles, Mortgage Loan Officer with NEXA Mortgage
          (NMLS #2640511, Corporate NMLS #1660690).{" "}
          <a href={NMLS_CONSUMER_ACCESS_LINK} target="_blank" rel="noreferrer">
            Verify on NMLS Consumer Access
          </a>
          . Equal Housing Opportunity.
        </span>
      </p>

      {!stateIneligible && (
        <p className="fine lead-alt">
          Rather go straight to your options?{" "}
          <a href={PREAPPROVAL_LINK}>
            Get pre-approved online
            <span className="sr-only"> (opens the lender's site)</span>
          </a>
          .
        </p>
      )}
    </form>
  );
}
