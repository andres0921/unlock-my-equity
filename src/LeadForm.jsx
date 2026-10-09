import { useState } from "react";
import { CONTACT_ENDPOINT, PHONE, PREAPPROVAL_LINK } from "./site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Take the next step" form. Sends the visitor's details (plus their
 * calculator estimate, if they ran one) to Andres's lead inbox, then offers
 * the pre-approval link. Nothing is sent until they press Submit.
 */
export function LeadForm({ estimate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    company: "", // honeypot: real visitors never see or fill this
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | fallback | error
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim())) {
      setError("Please add your name and a valid email.");
      return;
    }
    setStatus("sending");

    const details = [
      { label: "Property state", value: form.state },
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
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          interest: "HELOC (Unlock My Equity USA)",
          details: details.filter((d) => d.value),
          company: form.company,
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
      <div className="mini-form form-success" role="status">
        <h3>Thanks, {form.name.trim().split(" ")[0]}. I've got you.</h3>
        <p>
          {status === "sent"
            ? "I'll reach out shortly to talk through your options. No pressure at all."
            : `Your details came through. If you don't hear from me soon, call or text ${PHONE.display}.`}
        </p>
        <p>Want to see your HELOC options right now?</p>
        <a className="primary-cta full-width" href={PREAPPROVAL_LINK}>
          Check My HELOC Options
        </a>
      </div>
    );
  }

  return (
    <form className="mini-form" onSubmit={onSubmit} noValidate>
      <div className="mini-form-row">
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Full Name"
          aria-label="Full name"
          value={form.name}
          onChange={update("name")}
          required
        />
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email Address"
          aria-label="Email address"
          value={form.email}
          onChange={update("email")}
          required
        />
      </div>
      <div className="mini-form-row">
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Phone Number"
          aria-label="Phone number"
          value={form.phone}
          onChange={update("phone")}
        />
        <input
          type="text"
          name="state"
          autoComplete="address-level1"
          placeholder="Property State"
          aria-label="Property state"
          value={form.state}
          onChange={update("state")}
        />
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

      {error && <div className="warning-box">{error}</div>}
      {status === "error" && (
        <div className="warning-box">
          Something went wrong sending that. Please call or text {PHONE.display}, or
          use the pre-approval link below.
        </div>
      )}

      <button
        type="submit"
        className="primary-cta full-width form-submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Talk Through My Options"}
      </button>

      <p className="mini-form-note">
        By submitting, you agree that Andres Aviles (NEXA Mortgage, NMLS #2640511) may
        contact you by phone, text, or email about your request, including by automated
        means. Consent is not a condition of any loan. Message and data rates may apply.
        Reply STOP to opt out of texts.
      </p>
      <p className="mini-form-note">
        Rather go straight to your options?{" "}
        <a href={PREAPPROVAL_LINK}>Get pre-approved online</a>.
      </p>
    </form>
  );
}
