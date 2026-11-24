import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAQS,
  INELIGIBLE_STATES,
  PHONE,
  PREAPPROVAL_LINK,
  QUICK_TURN_STATES,
  STATES,
} from "./site";
import { Footer } from "./Footer";
import { LeadForm } from "./LeadForm";
import { Icon, Illo, SiteHeader, StickyCta } from "./ui";

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
    return `Properties in ${stateName} don't qualify through this site.`;
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

const CALC_STEPS = ["Your home", "Your profile", "Your estimate"];

const HOW_STEPS = [
  {
    title: "Tell us about the home",
    text: "Pick the property's state. If you'd like a number first, the calculator gives an illustrative estimate in 3 quick steps.",
  },
  {
    title: "Talk it through",
    text: "Andres reaches out by phone, text, or email to walk through your numbers and options. No pressure at all.",
  },
  {
    title: "Check your options",
    text: "Checking your options may involve a soft credit pull that does not affect your score. A full application may require a hard inquiry.",
  },
];

const USES = [
  {
    icon: "hammer",
    title: "Home improvements",
    text: "Renovate, upgrade, repair, or expand your home while putting your equity back into the property.",
  },
  {
    icon: "card",
    title: "Debt consolidation",
    text: "Replace higher-interest balances with a more structured strategy and free up room in your monthly budget.",
  },
  {
    icon: "key",
    title: "Real estate investing",
    text: "Use your equity for down payments, rehab capital, or reserves for your next investment move.",
  },
  {
    icon: "briefcase",
    title: "Business liquidity",
    text: "Create flexible capital for growth, opportunity, cash flow, or strategic business needs.",
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
  const [calcMoved, setCalcMoved] = useState(false);
  // Calculator buttons stay disabled until React hydrates, so the prerendered
  // form can never fall back to a native submission (which would reload the page).
  const [hydrated, setHydrated] = useState(false);

  const leadRef = useRef(null);
  const stepHeadingRef = useRef(null);
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

  const estimate =
    parsedHomeValue > 0 && creditRange ? { ...resultSummary, creditRange } : null;

  // The page is pre-rendered, so a visitor can type into the calculator
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
    setHydrated(true);
  }, []);

  // After moving between calculator steps, put focus on the new step's heading.
  useEffect(() => {
    if (calcMoved) stepHeadingRef.current?.focus();
  }, [calcMoved, step]);

  function nextStep(e) {
    e?.preventDefault();
    if (!hydrated) return;
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
    setCalcMoved(true);
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setShowStepErrors(false);
    setCalcMoved(true);
    setStep((prev) => Math.max(prev - 1, 1));
  }

  // Carry the estimate back up to the request form, on the right step.
  function sendEstimate(e) {
    if (!leadRef.current) return;
    e.preventDefault();
    leadRef.current.showContact();
  }

  const showBalanceWarning =
    homeValue && mortgageOwed && parsedHomeValue <= parsedMortgageOwed;

  // Explain what's missing when a visitor tries to continue too early.
  const homeMissing = showStepErrors && !(parsedHomeValue > 0);
  const owedMissing = showStepErrors && mortgageOwed === "";
  const creditMissing = showStepErrors && !creditRange;

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#next-step">
        Skip to the HELOC request form
      </a>
      <SiteHeader home />

      <main>
        {/* ---------------- Hero: the request form ---------------- */}
        <section className="hero" aria-labelledby="hero-title">
          {/* Desktop-only accents: hidden (and, being lazy, never fetched) on phones. */}
          <Illo
            name="c4-elevation"
            square
            className="hero-art hero-art-house"
            sizes="300px"
          />
          <Illo
            name="c4-samples"
            className="hero-art hero-art-swatches"
            sizes="280px"
          />

          <div className="container hero-inner">
            <p className="eyebrow">Home equity line of credit</p>
            <h1 id="hero-title">
              Unlock your home equity. <span>Keep your low first mortgage.</span>
            </h1>
            <p className="hero-sub">
              Two quick questions, then Andres Aviles of NEXA&nbsp;Mortgage follows&nbsp;up.
            </p>

            <div className="form-card" id="next-step" tabIndex={-1}>
              <LeadForm
                ref={leadRef}
                estimate={estimate}
                propertyState={propertyState}
                onPropertyStateChange={setPropertyState}
              />
            </div>

            <ul className="hero-points">
              <li>
                <Icon name="home" size={18} />
                Your first mortgage stays in place
              </li>
              <li>
                <Icon name="check" size={18} />
                Estimate in 3 quick steps
              </li>
              <li>
                <Icon name="check" size={18} />
                Funding in as little as 5 business days in some scenarios*
              </li>
            </ul>
            <p className="hero-footnote">
              *Fast-close and no-appraisal options depend on state, property type, title,
              county recording rules, valuation eligibility, remote online notarization
              availability, and final underwriting review.
            </p>
          </div>
        </section>

        {/* ---------------- Calculator (periwinkle band) ---------------- */}
        <section
          className="band band-periwinkle"
          id="calculator"
          tabIndex={-1}
          aria-labelledby="calc-title"
        >
          <div className="container narrow">
            <div className="section-head">
              <p className="eyebrow">HELOC calculator</p>
              <h2 id="calc-title">See how much you may be able to unlock</h2>
              <p>
                Three quick steps, no contact details needed. Anything you've entered
                above stays put.
              </p>
            </div>

            <div className="calc-card">
              {/* Always mounted so screen readers announce the amount when it appears. */}
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {step === 3
                  ? `Your illustrative estimate: ${resultSummary.estimatedLine} available HELOC.`
                  : ""}
              </p>

              <ol className="calc-steps" aria-label="Calculator progress">
                {CALC_STEPS.map((label, i) => {
                  const n = i + 1;
                  const state = step === n ? "current" : step > n ? "done" : "todo";
                  return (
                    <li
                      key={label}
                      className={`calc-step is-${state}`}
                      aria-current={step === n ? "step" : undefined}
                    >
                      <span className="calc-step-dot" aria-hidden="true">
                        {state === "done" ? <Icon name="check" size={14} /> : n}
                      </span>
                      <span className="calc-step-label">{label}</span>
                      {state === "done" && <span className="sr-only"> (completed)</span>}
                    </li>
                  );
                })}
              </ol>

              {step === 1 && (
                <form
                  className={`calc-panel ${calcMoved ? "has-moved" : ""}`}
                  onSubmit={nextStep}
                  noValidate
                >
                  <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                    <span className="sr-only">Step 1 of 3: </span>Tell us about your home
                  </h3>
                  <div className={`field ${homeMissing ? "has-error" : ""}`}>
                    <label htmlFor="calc-home">What is your home worth?</label>
                    {homeMissing && (
                      <span className="field-error" id="calc-home-error">
                        <Icon name="alert" size={16} />
                        Enter your estimated home value.
                      </span>
                    )}
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
                        aria-describedby={
                          homeMissing ? "calc-home-error calc-home-hint" : "calc-home-hint"
                        }
                        value={homeValue}
                        onChange={(e) => setHomeValue(formatNumberInput(e.target.value))}
                      />
                    </div>
                    <p className="field-hint" id="calc-home-hint">
                      Your best guess is fine.
                    </p>
                  </div>

                  <div className={`field ${owedMissing ? "has-error" : ""}`}>
                    <label htmlFor="calc-owed">How much do you still owe?</label>
                    {owedMissing && (
                      <span className="field-error" id="calc-owed-error">
                        <Icon name="alert" size={16} />
                        Enter your balance, or 0 if it's paid off.
                      </span>
                    )}
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
                          owedMissing ? "calc-owed-error calc-owed-hint" : "calc-owed-hint"
                        }
                        value={mortgageOwed}
                        onChange={(e) => setMortgageOwed(formatNumberInput(e.target.value))}
                      />
                    </div>
                    <p className="field-hint" id="calc-owed-hint">
                      Include all mortgage balances on the home. Enter 0 if it's paid off.
                    </p>
                  </div>

                  <div aria-live="polite">
                    {showBalanceWarning && (
                      <p className="notice notice-warn">
                        <Icon name="alert" size={18} />
                        <span>
                          Your home value should be greater than your mortgage balance
                          for a meaningful HELOC estimate.
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="calc-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg btn-block"
                      disabled={!hydrated}
                    >
                      Continue
                      <Icon name="arrowRight" size={18} />
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form className="calc-panel has-moved" onSubmit={nextStep} noValidate>
                  <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                    <span className="sr-only">Step 2 of 3: </span>A little about you
                  </h3>
                  <fieldset className="field">
                    <legend>What type of property is it?</legend>
                    <div className="choice-grid">
                      {[
                        ["owner", "Primary residence", "Assumed CLTV for this estimate: 80%"],
                        ["investment", "Investment property", "Assumed CLTV for this estimate: 75%"],
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

                  <div className={`field ${creditMissing ? "has-error" : ""}`}>
                    <label htmlFor="calc-credit">What is your estimated credit score?</label>
                    {creditMissing && (
                      <span className="field-error" id="calc-credit-error">
                        <Icon name="alert" size={16} />
                        Choose a range to see your estimate.
                      </span>
                    )}
                    <div className="select-wrap">
                      <select
                        id="calc-credit"
                        ref={creditRef}
                        aria-invalid={creditMissing || undefined}
                        aria-describedby={
                          creditMissing
                            ? "calc-credit-error calc-credit-hint"
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

                  <div className="calc-actions calc-actions-split">
                    <button type="button" className="btn btn-quiet" onClick={prevStep}>
                      <Icon name="arrowLeft" size={18} />
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={!hydrated}>
                      See my estimate
                      <Icon name="arrowRight" size={18} />
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="calc-panel has-moved">
                  <h3 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                    <span className="sr-only">Step 3 of 3: </span>Your illustrative estimate
                  </h3>

                  <div className="result">
                    <p className="result-label">Estimated available HELOC</p>
                    <p className="result-value">{resultSummary.estimatedLine}</p>
                    <dl className="result-math">
                      <div>
                        <dt>Home value</dt>
                        <dd>{resultSummary.homeValue}</dd>
                      </div>
                      <div>
                        <dt>Assumed CLTV for this estimate: {resultSummary.ltvLabel}</dt>
                        <dd>{formatCurrency(parsedHomeValue * maxLtv)}</dd>
                      </div>
                      <div>
                        <dt>Minus mortgage owed</dt>
                        <dd>&minus;{resultSummary.mortgageOwed}</dd>
                      </div>
                    </dl>
                    <p className="result-meta">
                      {resultSummary.propertyTypeLabel} · Credit {creditRange}
                    </p>
                  </div>

                  <p className="result-disclaimer">
                    <Icon name="info" size={18} />
                    <span>
                      Illustrative estimate only. Not a commitment to lend. Rates, terms,
                      and eligibility vary and are subject to underwriting. Your home
                      secures the line of credit.
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
                      <p className={`notice ${isIneligibleState ? "notice-warn" : "notice-ok"}`}>
                        <Icon name={isIneligibleState ? "alert" : "check"} size={18} />
                        <span>
                          <strong>Eligibility:</strong> {resultSummary.eligibilityMessage}
                        </span>
                      </p>
                    )}
                  </div>

                  <details className="calc-more">
                    <summary>Funding timing and credit notes</summary>
                    <p>
                      <strong>Fast funding note:</strong> {resultSummary.fastFundingMessage}
                    </p>
                    <p>
                      <strong>Credit insight:</strong> {resultSummary.creditMessage}
                    </p>
                  </details>

                  {!isIneligibleState ? (
                    <div className="calc-actions calc-actions-stack">
                      <a
                        className="btn btn-primary btn-lg btn-block"
                        href="#next-step"
                        onClick={sendEstimate}
                      >
                        Continue with this estimate
                        <Icon name="arrowRight" size={18} />
                      </a>
                      <div className="calc-actions-row">
                        <button type="button" className="btn btn-quiet" onClick={prevStep}>
                          <Icon name="arrowLeft" size={18} />
                          Back
                        </button>
                        <a className="text-link" href={PREAPPROVAL_LINK}>
                          Or get pre-approved online
                          <Icon name="external" size={16} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="calc-actions calc-actions-stack">
                      <p className="disabled-cta">
                        This property state is not eligible through this site.
                      </p>
                      <div className="calc-actions-row">
                        <button type="button" className="btn btn-quiet" onClick={prevStep}>
                          <Icon name="arrowLeft" size={18} />
                          Back
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="fine-print">
                    Estimates are for educational purposes only. Final line amount,
                    eligibility, pricing, timing, and appraisal requirements depend on
                    lender guidelines, state eligibility, title, valuation method, credit,
                    property review, and underwriting.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className="band" id="how-it-works" aria-labelledby="how-title">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title">Three easy steps, at your pace</h2>
            </div>
            <ol className="how-list">
              {HOW_STEPS.map((s, i) => (
                <li key={s.title} className="how-item">
                  <span className="how-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Ways to use equity (gridded white band) ---------------- */}
        <section className="band band-paper" id="uses" aria-labelledby="uses-title">
          {/* id="benefits" keeps old /#benefits campaign links working. */}
          <div className="container" id="benefits">
            <div className="section-head">
              <p className="eyebrow">Ways to use your equity</p>
              <h2 id="uses-title">Put it toward things that last</h2>
              <p>
                A HELOC can be a smart tool when it creates value, improves cash flow,
                or strengthens your overall position.
              </p>
            </div>
            <ul className="uses-grid">
              {USES.map((u) => (
                <li key={u.title} className="use-card">
                  <span className="use-icon" aria-hidden="true">
                    <Icon name={u.icon} size={26} />
                  </span>
                  <h3>{u.title}</h3>
                  <p>{u.text}</p>
                </li>
              ))}
            </ul>
            <p className="wise-note">
              <Icon name="shield" size={20} />
              <span>
                We generally do <strong>not</strong> recommend using a HELOC for a car, a
                vacation, or short-term lifestyle spending. Since your home secures the
                line, it is usually better used for things that create lasting value or
                improve your financial position.
              </span>
            </p>
          </div>
        </section>

        {/* ---------------- Illustrated guides ---------------- */}
        <section className="band" id="guides" aria-labelledby="guides-title">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Guides</p>
              <h2 id="guides-title">Learn the basics in plain English</h2>
            </div>

            <div className="guide-rows">
              <article className="guide-row">
                <div className="guide-row-art">
                  <Illo
                    name="c4-samples"
                    alt="Colored-pencil drawing on grid paper of flooring, tile, and cabinet samples pulled apart in an exploded view."
                    sizes="(min-width: 900px) 540px, calc(100vw - 32px)"
                  />
                </div>
                <div className="guide-row-copy">
                  <p className="eyebrow">HELOC basics</p>
                  <h3>How a HELOC works, in plain English</h3>
                  <p>
                    How much you can borrow, the draw and repayment periods, how the rate
                    works, what it takes to get approved, and the tax rules.
                  </p>
                  <a className="btn btn-outline" href="/how-a-heloc-works">
                    Read the guide
                    <Icon name="arrowRight" size={18} />
                  </a>
                </div>
              </article>

              {/* id="borrow-better" keeps old /#borrow-better campaign links working. */}
              <article className="guide-row is-flipped" id="borrow-better">
                <div className="guide-row-art">
                  <Illo
                    name="c4-floorplan"
                    alt="Colored-pencil drawing on grid paper of a folded floor plan with a ruler and a pencil."
                    sizes="(min-width: 900px) 540px, calc(100vw - 32px)"
                  />
                </div>
                <div className="guide-row-copy">
                  <p className="eyebrow">Compare your options</p>
                  <h3>Get cash without starting your mortgage over</h3>
                  <p>
                    A cash-out refinance replaces your mortgage, and its rate, on your
                    whole balance. A HELOC leaves your first mortgage alone and adds a
                    separate line behind it.
                  </p>
                  <a className="btn btn-outline" href="/heloc-vs-cash-out-refinance">
                    HELOC vs. cash-out refinance
                    <Icon name="arrowRight" size={18} />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="band band-lavender" id="faq" aria-labelledby="faq-title">
          <div className="container narrow">
            <div className="section-head">
              <p className="eyebrow">Frequently asked questions</p>
              <h2 id="faq-title">What homeowners ask first</h2>
            </div>
            <div className="faq-list">
              {FAQS.map((faq) => (
                <details key={faq.question} className="faq-item">
                  <summary>
                    <span>{faq.question}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <Icon name="plus" size={20} />
                    </span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className="faq-cta">
              <p>
                Still have a question? Call or text{" "}
                <a href={PHONE.href}>{PHONE.display}</a>, or start your request.
              </p>
              <a className="btn btn-primary btn-lg" href="#next-step">
                Start my HELOC request
                <Icon name="arrowRight" size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyCta />
    </div>
  );
}
