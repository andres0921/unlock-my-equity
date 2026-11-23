import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAQS,
  GUIDES,
  INELIGIBLE_STATES,
  PHONE,
  PREAPPROVAL_LINK,
  QUICK_TURN_STATES,
  STATES,
} from "./site";
import { Footer } from "./Footer";
import { LeadForm } from "./LeadForm";
import { Icon, Photo, SiteHeader } from "./ui";

function formatNumberInput(value) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function parseCurrency(value) {
  return Number(String(value || "").replace(/,/g, ""));
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "$0";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getCreditMessage(creditRange) {
  switch (creditRange) {
    case "760+":
      return "Excellent credit. You may qualify for some of the strongest HELOC pricing and options available, subject to final review.";
    case "720-759":
      return "Very solid credit. Many borrowers in this range are well positioned for competitive HELOC options.";
    case "680-719":
      return "You may still have strong options available, although pricing and terms can vary.";
    case "640-679":
      return "Approval may still be possible, but pricing and structure will depend more heavily on the overall file.";
    case "Below 640":
      return "Programs may be more limited, but a full review can help determine what may still be available.";
    default:
      return "Your credit estimate helps determine pricing, eligibility, and available options.";
  }
}

function getEligibilityMessage(stateName) {
  if (!stateName) return "";
  if (INELIGIBLE_STATES.includes(stateName)) {
    return `Properties located in ${stateName} do not qualify through this site.`;
  }
  return `Properties in ${stateName} may qualify, subject to product guidelines, underwriting, and state requirements.`;
}

function getFastFundingMessage(stateName) {
  if (!stateName) {
    return "Some borrowers may qualify for funding in as little as 5 business days without an appraisal, depending on property, state, remote online notarization availability, and final underwriting.";
  }

  if (INELIGIBLE_STATES.includes(stateName)) {
    return `${stateName} properties are not eligible through this site, so fast-funding options are not available here.`;
  }

  if (QUICK_TURN_STATES.includes(stateName)) {
    return `Properties in ${stateName} may qualify for funding in as little as 5 business days without an appraisal in some scenarios, depending on property review, county recording rules, remote online notarization eligibility, and underwriting.`;
  }

  return `Funding timelines in ${stateName} can vary based on state requirements, county recording rules, property type, title, and underwriting. Some files may still move quickly, but additional steps may be required.`;
}

const STEPS = ["Your home", "Your profile", "Your estimate"];

const USES = [
  {
    photo: "use-renovation",
    alt: "A smiling homeowner wiping down the island in a bright, newly renovated kitchen with light wood cabinets.",
    title: "Home improvements",
    text: "Renovate, upgrade, repair, or expand your home while putting your equity back into the property.",
  },
  {
    photo: "use-debt",
    alt: "A couple at their dining table reviewing finances together on a laptop, with paperwork and a coffee mug nearby.",
    title: "Paying down higher-interest debt",
    text: "Replace higher-interest balances with a more structured strategy and free up room in your monthly budget.",
  },
  {
    photo: "use-education",
    alt: "A mother and her college-age daughter smiling on the couch while looking at a tablet together.",
    title: "Major planned expenses",
    text: "Plan ahead for major planned expenses, so you are not scrambling when the bill arrives.",
  },
];

const HOW_STEPS = [
  {
    icon: "calculator",
    title: "Estimate your line",
    text: "Enter your home value and what you owe. You'll see an illustrative estimate in 3 quick steps, no contact info needed.",
  },
  {
    icon: "chat",
    title: "Talk it through",
    text: "Request a follow-up and I'll reach out by phone, text, or email to walk through your numbers and options. No pressure.",
  },
  {
    icon: "doc",
    title: "Check your rate and apply",
    text: "Checking your rate starts with a soft credit pull that won't affect your score. A full application requires a hard pull.",
  },
];

export default function App() {
  const [step, setStep] = useState(1);
  const [homeValue, setHomeValue] = useState("");
  const [mortgageOwed, setMortgageOwed] = useState("");
  const [occupancyType, setOccupancyType] = useState("owner");
  const [creditRange, setCreditRange] = useState("");
  const [propertyState, setPropertyState] = useState("");

  const [showStepErrors, setShowStepErrors] = useState(false);

  const stepHeadingRef = useRef(null);
  const movedRef = useRef(false);
  const homeRef = useRef(null);
  const owedRef = useRef(null);
  const creditRef = useRef(null);

  const parsedHomeValue = parseCurrency(homeValue);
  const parsedMortgageOwed = parseCurrency(mortgageOwed);

  const maxLtv = occupancyType === "owner" ? 0.8 : 0.75;
  const estimatedLine = Math.max(parsedHomeValue * maxLtv - parsedMortgageOwed, 0);
  const isIneligibleState = INELIGIBLE_STATES.includes(propertyState);

  // A blank balance would silently count as $0, so ask for an explicit 0.
  const canContinueStep1 =
    parsedHomeValue > 0 &&
    mortgageOwed !== "" &&
    parsedMortgageOwed >= 0 &&
    parsedHomeValue > parsedMortgageOwed;

  const canContinueStep2 = occupancyType && creditRange;

  const resultSummary = useMemo(() => {
    return {
      homeValue: formatCurrency(parsedHomeValue),
      mortgageOwed: formatCurrency(parsedMortgageOwed),
      estimatedLine: formatCurrency(estimatedLine),
      ltvLabel: occupancyType === "owner" ? "80%" : "75%",
      propertyTypeLabel:
        occupancyType === "owner" ? "Primary Residence" : "Investment Property",
      creditMessage: getCreditMessage(creditRange),
      fastFundingMessage: getFastFundingMessage(propertyState),
      eligibilityMessage: getEligibilityMessage(propertyState),
    };
  }, [
    parsedHomeValue,
    parsedMortgageOwed,
    estimatedLine,
    occupancyType,
    creditRange,
    propertyState,
  ]);

  // The page is pre-rendered, so a visitor can type into the first step
  // before the app loads. Pick up those values so Continue works right away.
  useEffect(() => {
    const homeEl = homeRef.current;
    const owedEl = owedRef.current;
    if (homeEl && owedEl && (homeEl.value || owedEl.value)) {
      const typedHome = formatNumberInput(homeEl.value);
      const typedOwed = formatNumberInput(owedEl.value);
      setHomeValue((v) => v || typedHome);
      setMortgageOwed((v) => v || typedOwed);
    }
  }, []);

  // After moving between calculator steps, put focus on the new step's heading.
  useEffect(() => {
    if (movedRef.current) stepHeadingRef.current?.focus();
  }, [step]);

  function nextStep(e) {
    e?.preventDefault();
    if (step === 1 && !canContinueStep1) {
      setShowStepErrors(true);
      if (!(parsedHomeValue > 0)) homeRef.current?.focus();
      else owedRef.current?.focus();
      return;
    }
    if (step === 2 && !canContinueStep2) {
      setShowStepErrors(true);
      creditRef.current?.focus();
      return;
    }
    setShowStepErrors(false);
    movedRef.current = true;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setShowStepErrors(false);
    movedRef.current = true;
    setStep((prev) => Math.max(prev - 1, 1));
  }

  const showBalanceWarning =
    homeValue && mortgageOwed && parsedHomeValue <= parsedMortgageOwed;

  // Explain what's missing when a visitor tries to continue too early.
  const homeMissing = showStepErrors && !(parsedHomeValue > 0);
  const owedMissing = showStepErrors && mortgageOwed === "";
  const creditMissing = showStepErrors && !creditRange;
  let step1Error = "";
  if (homeMissing && owedMissing) {
    step1Error = "Enter your home value and your mortgage balance (0 if it's paid off) to continue.";
  } else if (homeMissing) {
    step1Error = "Enter your estimated home value to continue.";
  } else if (owedMissing) {
    step1Error = "Enter your mortgage balance to continue. Use 0 if it's paid off.";
  }

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#calculator">
        Skip to the HELOC calculator
      </a>
      <SiteHeader home />

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <Icon name="home" size={16} /> Home equity line of credit (HELOC)
              </p>
              <h1 id="hero-title">
                Tap your home equity. <em>Keep your first mortgage.</em>
              </h1>
              <p className="hero-sub">
                Estimate how much you could borrow with a HELOC while keeping your
                current first mortgage, and its rate, in place.
              </p>
              <ul className="check-list">
                <li>
                  <Icon name="check" size={18} />
                  See an estimate in 3 quick steps
                </li>
                <li>
                  <Icon name="check" size={18} />
                  No refinance of your first mortgage
                </li>
                <li>
                  <Icon name="check" size={18} />
                  Funding in as little as 5 business days in some scenarios*
                </li>
              </ul>
              <div className="hero-ctas">
                <a className="btn btn-primary btn-lg" href="#calculator">
                  See my HELOC estimate
                  <Icon name="arrowDown" size={18} />
                </a>
                <a className="btn btn-ghost btn-lg" href={PREAPPROVAL_LINK}>
                  Get pre-approved online
                </a>
              </div>
              <p className="hero-cta-note">No contact details needed to see your estimate.</p>
              <p className="hero-footnote">
                *Fast-close and no-appraisal options depend on state, property type,
                title, county recording rules, valuation eligibility, remote online
                notarization availability, and final underwriting review.
              </p>
            </div>

            <div className="hero-media">
              <div className="hero-photo">
                <Photo
                  name="hero-homeowners"
                  priority
                  sizes="(min-width: 1192px) 535px, (min-width: 1024px) calc(49vw - 47px), calc(100vw - 32px)"
                  alt="A smiling couple standing together on the front porch steps of their home at golden hour."
                />
              </div>
              <figure className="example-card" aria-label="Example calculation">
                <figcaption>
                  <span className="pill">Example</span>
                  <span className="example-cap">Illustration only</span>
                </figcaption>
                <dl>
                  <div>
                    <dt>Home value</dt>
                    <dd>$500,000</dd>
                  </div>
                  <div>
                    <dt>Mortgage owed</dt>
                    <dd>$250,000</dd>
                  </div>
                  <div>
                    <dt>At 80% CLTV</dt>
                    <dd>$400,000</dd>
                  </div>
                </dl>
                <div className="example-total">
                  <span>Example line</span>
                  <strong>$150,000</strong>
                </div>
              </figure>
            </div>
          </div>
        </section>

        {/* ---------------- Calculator + lead form ---------------- */}
        <section
          className="flow-section"
          id="calculator"
          tabIndex={-1}
          aria-labelledby="calc-title"
        >
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">HELOC calculator</p>
              <h2 id="calc-title">See how much you may be able to unlock</h2>
              <p>
                Three quick steps. Your estimate shows before we ask for any contact
                details.
              </p>
            </div>

            <div className="flow-grid">
              <div className="calc-card">
                <ol className="stepper" aria-label="Calculator progress">
                  {STEPS.map((label, i) => {
                    const n = i + 1;
                    const state = step === n ? "current" : step > n ? "done" : "todo";
                    return (
                      <li
                        key={label}
                        className={`stepper-item is-${state}`}
                        aria-current={step === n ? "step" : undefined}
                      >
                        <span className="stepper-dot" aria-hidden="true">
                          {state === "done" ? <Icon name="check" size={14} /> : n}
                        </span>
                        <span className="stepper-label">{label}</span>
                        {state === "done" && <span className="sr-only"> (completed)</span>}
                      </li>
                    );
                  })}
                </ol>

                {step === 1 && (
                  <form className="step-panel" onSubmit={nextStep} noValidate>
                    <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                      <span className="sr-only">Step 1 of 3: </span>Tell us about your home
                    </h3>
                    <div className="field">
                      <label htmlFor="calc-home">What is your home worth?</label>
                      <div className="money-input">
                        <span aria-hidden="true">$</span>
                        <input
                          id="calc-home"
                          ref={homeRef}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="500,000"
                          aria-invalid={homeMissing || undefined}
                          aria-describedby={homeMissing ? "calc-step1-error" : undefined}
                          value={homeValue}
                          onChange={(e) => setHomeValue(formatNumberInput(e.target.value))}
                        />
                      </div>
                      <p className="field-hint">Your best guess is fine.</p>
                    </div>

                    <div className="field">
                      <label htmlFor="calc-owed">How much do you still owe?</label>
                      <div className="money-input">
                        <span aria-hidden="true">$</span>
                        <input
                          id="calc-owed"
                          ref={owedRef}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="250,000"
                          aria-invalid={owedMissing || undefined}
                          aria-describedby={
                            owedMissing ? "calc-owed-hint calc-step1-error" : "calc-owed-hint"
                          }
                          value={mortgageOwed}
                          onChange={(e) =>
                            setMortgageOwed(formatNumberInput(e.target.value))
                          }
                        />
                      </div>
                      <p className="field-hint" id="calc-owed-hint">
                        Include all mortgage balances on the home. Enter 0 if it's paid
                        off.
                      </p>
                    </div>

                    <div aria-live="polite">
                      {step1Error && (
                        <div className="notice notice-warn" id="calc-step1-error">
                          <Icon name="alert" size={18} />
                          <span>{step1Error}</span>
                        </div>
                      )}
                      {showBalanceWarning && (
                        <div className="notice notice-warn">
                          <Icon name="alert" size={18} />
                          <span>
                            Your home value should be greater than your mortgage balance
                            for a meaningful HELOC estimate.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="calc-actions">
                      <button type="submit" className="btn btn-primary btn-lg">
                        Continue
                        <Icon name="arrowRight" size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form className="step-panel" onSubmit={nextStep} noValidate>
                    <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                      <span className="sr-only">Step 2 of 3: </span>A little about you
                    </h3>
                    <fieldset className="field">
                      <legend>What type of property is it?</legend>
                      <div className="choice-grid">
                        {[
                          ["owner", "Primary residence", "Assumed CLTV for this estimate: 80%"],
                          [
                            "investment",
                            "Investment property",
                            "Assumed CLTV for this estimate: 75%",
                          ],
                        ].map(([value, title, sub]) => (
                          <label
                            key={value}
                            className={`choice ${occupancyType === value ? "is-selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="occupancy"
                              value={value}
                              checked={occupancyType === value}
                              onChange={() => setOccupancyType(value)}
                            />
                            <span className="choice-body">
                              <strong>{title}</strong>
                              <span>{sub}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="field">
                      <label htmlFor="calc-credit">What is your estimated credit score?</label>
                      <div className="select-wrap">
                        <select
                          id="calc-credit"
                          ref={creditRef}
                          aria-invalid={creditMissing || undefined}
                          aria-describedby={
                            creditMissing
                              ? "calc-credit-hint calc-credit-error"
                              : "calc-credit-hint"
                          }
                          value={creditRange}
                          onChange={(e) => setCreditRange(e.target.value)}
                        >
                          <option value="">Select a range</option>
                          <option value="760+">760+</option>
                          <option value="720-759">720-759</option>
                          <option value="680-719">680-719</option>
                          <option value="640-679">640-679</option>
                          <option value="Below 640">Below 640</option>
                        </select>
                      </div>
                      <p className="field-hint" id="calc-credit-hint">
                        Your credit range doesn't change this estimate. It helps shape
                        pricing, eligibility, and available options.
                      </p>
                    </div>

                    <div aria-live="polite">
                      {creditMissing && (
                        <div className="notice notice-warn" id="calc-credit-error">
                          <Icon name="alert" size={18} />
                          <span>Choose your estimated credit range to see your estimate.</span>
                        </div>
                      )}
                    </div>

                    <div className="calc-actions">
                      <button type="button" className="btn btn-quiet" onClick={prevStep}>
                        Back
                      </button>
                      <button type="submit" className="btn btn-primary btn-lg">
                        See my estimate
                        <Icon name="arrowRight" size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <div className="step-panel">
                    <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                      <span className="sr-only">Step 3 of 3: </span>Your illustrative
                      estimate
                    </h3>

                    <div className="result" aria-live="polite" aria-atomic="true">
                      <p className="result-label">Estimated available HELOC</p>
                      <p className="result-value">{resultSummary.estimatedLine}</p>
                      <dl className="result-math">
                        <div>
                          <dt>Home value</dt>
                          <dd>{resultSummary.homeValue}</dd>
                        </div>
                        <div>
                          <dt>Up to {resultSummary.ltvLabel} CLTV</dt>
                          <dd>
                            {formatCurrency(parsedHomeValue * maxLtv)}
                          </dd>
                        </div>
                        <div>
                          <dt>Minus mortgage owed</dt>
                          <dd>&minus;{resultSummary.mortgageOwed}</dd>
                        </div>
                      </dl>
                      <p className="result-meta">
                        {resultSummary.propertyTypeLabel} · Credit {creditRange}. The{" "}
                        {resultSummary.ltvLabel} figure is an illustrative combined
                        loan-to-value (CLTV) assumption.
                      </p>
                    </div>

                    <p className="result-disclaimer">
                      <Icon name="info" size={16} />
                      <span>
                        Illustrative estimate only. Not a commitment to lend. Rates,
                        terms, and eligibility vary and are subject to underwriting.
                        Your home secures the line of credit.
                      </span>
                    </p>

                    <div className="field">
                      <label htmlFor="calc-state">What state is the property in?</label>
                      <div className="select-wrap">
                        <select
                          id="calc-state"
                          value={propertyState}
                          onChange={(e) => setPropertyState(e.target.value)}
                        >
                          <option value="">Select your state</option>
                          {STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div aria-live="polite">
                      {propertyState && (
                        <div
                          className={`notice ${isIneligibleState ? "notice-warn" : "notice-ok"}`}
                        >
                          <Icon name={isIneligibleState ? "alert" : "check"} size={18} />
                          <span>
                            <strong>Eligibility:</strong>{" "}
                            {resultSummary.eligibilityMessage}
                          </span>
                        </div>
                      )}
                    </div>

                    <details className="calc-more">
                      <summary>Funding timing and credit notes</summary>
                      <p>
                        <strong>Fast funding note:</strong>{" "}
                        {resultSummary.fastFundingMessage}
                      </p>
                      <p>
                        <strong>Credit insight:</strong> {resultSummary.creditMessage}
                      </p>
                    </details>

                    {!isIneligibleState ? (
                      <div className="calc-actions calc-actions-stack">
                        <a className="btn btn-primary btn-lg btn-block" href="#next-step">
                          Request a HELOC follow-up
                          <Icon name="arrowDown" size={18} />
                        </a>
                        <div className="calc-actions-row">
                          <button type="button" className="btn btn-quiet" onClick={prevStep}>
                            Back
                          </button>
                          <a className="text-link" href={PREAPPROVAL_LINK}>
                            Or continue to the lender's site
                            <Icon name="external" size={16} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="calc-actions calc-actions-stack">
                        <div className="disabled-cta">
                          This property state is not eligible through this site.
                        </div>
                        <div className="calc-actions-row">
                          <button type="button" className="btn btn-quiet" onClick={prevStep}>
                            Back
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="fine-print">
                      Estimates are for educational purposes only. Final line amount,
                      eligibility, pricing, timing, and appraisal requirements depend on
                      lender guidelines, state eligibility, title, valuation method,
                      credit, property review, and underwriting.
                    </p>
                  </div>
                )}
              </div>

              <div className="lead-card" id="next-step">
                <p className="eyebrow">Next step</p>
                <h2 className="lead-title">Request a HELOC follow-up</h2>
                <p className="lead-sub">
                  Send your details and I'll personally reach out to walk through your
                  numbers. {estimatedLine > 0 && creditRange && step === 3
                    ? "Your estimate is included automatically."
                    : "If you run the calculator first, your estimate is included."}
                </p>
                <LeadForm
                  suggestedState={propertyState}
                  estimate={
                    parsedHomeValue > 0 && creditRange
                      ? { ...resultSummary, creditRange }
                      : null
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className="section" id="how-it-works" aria-labelledby="how-title">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title">Three steps, at your pace</h2>
            </div>
            <ol className="how-grid">
              {HOW_STEPS.map((s, i) => (
                <li key={s.title} className="how-item">
                  <div className="how-top">
                    <span className="how-num" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <Icon name={s.icon} size={24} className="how-icon" />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Uses ---------------- */}
        <section className="section section-tint" id="uses" aria-labelledby="uses-title">
          {/* id="benefits" keeps old /#benefits campaign links working. */}
          <div className="container" id="benefits">
            <div className="section-head">
              <p className="eyebrow">Ways homeowners use equity</p>
              <h2 id="uses-title">Put your equity toward things that last</h2>
              <p>
                A HELOC can be a smart tool when it creates value, improves cash flow,
                or strengthens your overall position.
              </p>
            </div>
            <div className="uses-grid">
              {USES.map((u) => (
                <article key={u.title} className="use-card">
                  <div className="use-photo">
                    <Photo
                      name={u.photo}
                      alt={u.alt}
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="use-body">
                    <h3>{u.title}</h3>
                    <p>{u.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="uses-foot">
              <p>
                <strong>Also common:</strong> real estate investing (down payments, rehab
                capital, reserves) and business liquidity.
              </p>
              <p className="wise">
                <Icon name="shield" size={18} />
                <span>
                  We generally do <strong>not</strong> recommend using a HELOC for a
                  car, a vacation, or short-term lifestyle spending. Since your home
                  secures the line, it is usually better used for things that create
                  lasting value or improve your financial position.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- Compare ---------------- */}
        <section className="section" id="compare" aria-labelledby="compare-title">
          {/* id="borrow-better" keeps old /#borrow-better campaign links working. */}
          <div className="container compare-grid" id="borrow-better">
            <div className="compare-copy">
              <p className="eyebrow">HELOC vs. cash-out refinance</p>
              <h2 id="compare-title">Get cash without starting your mortgage over</h2>
              <p>
                If you already have a strong first mortgage, a HELOC can let you access
                cash without refinancing out of it. That can make a big difference in
                today's rate environment.
              </p>
              <a className="text-link" href="/heloc-vs-cash-out-refinance">
                Read the full comparison
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <caption className="sr-only">
                  HELOC compared with a cash-out refinance
                </caption>
                <thead>
                  <tr>
                    <td></td>
                    <th scope="col">HELOC</th>
                    <th scope="col">Cash-out refi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Your current mortgage</th>
                    <td>Stays in place, rate and all</td>
                    <td>Paid off and replaced</td>
                  </tr>
                  <tr>
                    <th scope="row">New rate applies to</th>
                    <td>Only what you borrow on the line</td>
                    <td>Your entire new balance</td>
                  </tr>
                  <tr>
                    <th scope="row">Often a fit when</th>
                    <td>Your first mortgage rate is low</td>
                    <td>Today's rates beat your current rate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="section section-tint" id="faq" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="section-head">
              <p className="eyebrow">Frequently asked questions</p>
              <h2 id="faq-title">What homeowners ask before moving forward</h2>
              <p>
                Still curious? Call or text <a href={PHONE.href}>{PHONE.display}</a>.
              </p>
            </div>
            <div className="faq-list">
              {FAQS.map((faq) => (
                <details key={faq.question} className="faq-item">
                  <summary>
                    <span>{faq.question}</span>
                    <Icon name="plus" size={20} className="faq-icon" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Guides ---------------- */}
        <section className="section" id="guides" aria-labelledby="guides-title">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Guides</p>
              <h2 id="guides-title">Learn the basics in plain English</h2>
            </div>
            <div className="guide-cards">
              {GUIDES.map((g, i) => (
                <a key={g.path} className="guide-card" href={g.path}>
                  <div className="guide-card-photo">
                    <Photo
                      name={i === 0 ? "guide-how-heloc-works" : "guide-heloc-vs-refi"}
                      ratio="16:9"
                      alt=""
                      sizes="(min-width: 768px) 540px, 100vw"
                    />
                  </div>
                  <span className="guide-card-body">
                    <span className="guide-card-title">{g.label}</span>
                    <Icon name="arrowRight" size={20} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="final-cta" aria-labelledby="final-title">
          <div className="container final-inner">
            <div>
              <h2 id="final-title">See what your equity could do for you</h2>
              <p>
                Get an illustrative estimate in 3 quick steps, then decide if you want
                to talk it through.
              </p>
            </div>
            <div className="final-actions">
              <a className="btn btn-light btn-lg" href="#calculator">
                Estimate my HELOC
              </a>
              <a className="btn btn-outline-light btn-lg" href={PHONE.href}>
                <Icon name="phone" size={18} />
                Call or text {PHONE.display}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer home />
    </div>
  );
}
