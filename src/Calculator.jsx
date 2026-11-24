import { useEffect, useRef, useState } from "react";
import { PREAPPROVAL_LINK, STATES } from "./site";
import { formatNumberInput } from "./estimate";
import { Icon } from "./ui";

const CREDIT_RANGES = ["760+", "720-759", "680-719", "640-679", "Below 640"];

const OCCUPANCY = [
  ["owner", "Primary residence", "Assumed CLTV for this estimate: 80%"],
  ["investment", "Investment property", "Assumed CLTV for this estimate: 75%"],
];

/**
 * The hero "workbench": a single panel whose estimate re-renders on every
 * keystroke. Completed results are announced politely to screen readers once
 * typing pauses, so they are not read out digit by digit.
 */
export function Calculator({ calc }) {
  const { values, set, home, owed, owedEntered, complete, summary, isIneligibleState } = calc;
  const [touched, setTouched] = useState({ home: false, owed: false });
  const [announcement, setAnnouncement] = useState("");

  const homeRef = useRef(null);
  const owedRef = useRef(null);
  const creditRef = useRef(null);
  const stateRef = useRef(null);
  const panelRef = useRef(null);

  // The page is pre-rendered, so a visitor can type before the app loads.
  // Pick up whatever is already in the fields so nothing is lost.
  useEffect(() => {
    const typedHome = formatNumberInput(homeRef.current?.value);
    const typedOwed = formatNumberInput(owedRef.current?.value);
    const typedCredit = creditRef.current?.value || "";
    const typedState = stateRef.current?.value || "";
    const typedType = panelRef.current?.querySelector('input[name="occupancy"]:checked')?.value;
    if (typedHome) set.setHomeValue((v) => v || typedHome);
    if (typedOwed) set.setMortgageOwed((v) => v || typedOwed);
    if (typedCredit) set.setCreditRange((v) => v || typedCredit);
    if (typedState) set.setPropertyState((v) => v || typedState);
    if (typedType) set.setOccupancyType(typedType);
    // Run once, on hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Announce a finished estimate after a short pause in typing.
  const spoken = complete
    ? `Estimated available HELOC: ${summary.estimatedLine}, at an assumed ${summary.ltvLabel} CLTV. Illustrative estimate only.`
    : "";
  useEffect(() => {
    const t = setTimeout(() => setAnnouncement(spoken), 700);
    return () => clearTimeout(t);
  }, [spoken]);

  const homeError = touched.home && !(home > 0) ? "Enter your estimated home value." : "";
  const owedError =
    touched.owed && !owedEntered ? "Enter what you still owe. Use 0 if it's paid off." : "";
  const balanceWarning =
    home > 0 && owedEntered && home <= owed
      ? "Your home value should be greater than your mortgage balance for a meaningful HELOC estimate."
      : "";

  const blank = "—";

  return (
    <section
      ref={panelRef}
      className="calc"
      id="calculator"
      tabIndex={-1}
      aria-labelledby="calc-title"
    >
      <div className="calc-head">
        <h2 id="calc-title" className="calc-title">
          HELOC estimate
        </h2>
        <p className="calc-tag">Updates as you type</p>
      </div>

      <div className="calc-grid">
        <div className="calc-inputs">
          <div className="field">
            <label htmlFor="calc-home">Home value</label>
            <div className={`money ${homeError ? "is-invalid" : ""}`}>
              <span aria-hidden="true">$</span>
              <input
                id="calc-home"
                ref={homeRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="500,000"
                value={values.homeValue}
                onChange={(e) => set.setHomeValue(formatNumberInput(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, home: true }))}
                aria-invalid={homeError ? true : undefined}
                aria-describedby={homeError ? "calc-home-hint calc-home-error" : "calc-home-hint"}
              />
            </div>
            <p className="hint" id="calc-home-hint">
              Your best guess is fine.
            </p>
            <div aria-live="polite">
              {homeError && (
                <p className="field-error" id="calc-home-error">
                  <Icon name="alert" size={16} />
                  {homeError}
                </p>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="calc-owed">Mortgage balance owed</label>
            <div className={`money ${owedError || balanceWarning ? "is-invalid" : ""}`}>
              <span aria-hidden="true">$</span>
              <input
                id="calc-owed"
                ref={owedRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="250,000"
                value={values.mortgageOwed}
                onChange={(e) => set.setMortgageOwed(formatNumberInput(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, owed: true }))}
                aria-invalid={owedError || balanceWarning ? true : undefined}
                aria-describedby={
                  owedError || balanceWarning
                    ? "calc-owed-hint calc-owed-error"
                    : "calc-owed-hint"
                }
              />
            </div>
            <p className="hint" id="calc-owed-hint">
              All mortgages on the home combined. Enter 0 if it's paid off.
            </p>
            <div aria-live="polite">
              {(owedError || balanceWarning) && (
                <p className="field-error" id="calc-owed-error">
                  <Icon name="alert" size={16} />
                  {owedError || balanceWarning}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="readout">
          <p className="readout-label">Estimated available HELOC</p>
          <p className={`readout-value ${complete ? "" : "is-empty"}`}>
            {complete ? summary.estimatedLine : "$" + blank}
          </p>
          <dl className="readout-math">
            <div>
              <dt>Home value</dt>
              <dd>{home > 0 ? summary.homeValue : blank}</dd>
            </div>
            <div>
              <dt>&times; {summary.ltvLabel} assumed CLTV</dt>
              <dd>{home > 0 ? summary.maxLine : blank}</dd>
            </div>
            <div>
              <dt>&minus; Mortgage owed</dt>
              <dd>{owedEntered ? summary.mortgageOwed : blank}</dd>
            </div>
          </dl>
          {!complete && (
            <p className="readout-empty">
              Enter your home value and balance to see your estimate.
            </p>
          )}
          <p className="readout-disclosure">
            Illustrative estimate only. Not a commitment to lend. Rates, terms, and
            eligibility vary and are subject to underwriting. Your home secures the line
            of credit.
          </p>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
        </div>

        {/* Below the readout on small screens, so the estimate sits right under the money inputs. */}
        <div className="calc-type">
          <fieldset className="field">
            <legend>Property type</legend>
            <div className="choices">
              {OCCUPANCY.map(([value, title, sub]) => (
                <label key={value} className="choice">
                  <input
                    type="radio"
                    name="occupancy"
                    value={value}
                    checked={values.occupancyType === value}
                    onChange={() => set.setOccupancyType(value)}
                  />
                  <span className="choice-body">
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="calc-refine">
          <p className="refine-title">
            Optional details <span>(don't change the math)</span>
          </p>
          <div className="refine-grid">
            <div className="field">
              <label htmlFor="calc-credit">Estimated credit score</label>
              <div className="select">
                <select
                  id="calc-credit"
                  ref={creditRef}
                  value={values.creditRange}
                  onChange={(e) => set.setCreditRange(e.target.value)}
                >
                  <option value="">Select a range</option>
                  {CREDIT_RANGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="calc-state">Property state</label>
              <div className="select">
                <select
                  id="calc-state"
                  ref={stateRef}
                  value={values.propertyState}
                  onChange={(e) => set.setPropertyState(e.target.value)}
                  aria-describedby={values.propertyState ? "calc-eligibility" : undefined}
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
          <div aria-live="polite">
            {values.propertyState && (
              <p
                id="calc-eligibility"
                className={`notice ${isIneligibleState ? "notice-error" : "notice-info"}`}
              >
                <Icon name={isIneligibleState ? "alert" : "check"} size={18} />
                <span>
                  <strong>Eligibility:</strong> {summary.eligibilityMessage}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="calc-act">
          {!isIneligibleState ? (
            <>
              <a className="btn btn-primary btn-block" href="#next-step">
                {complete ? "Send this estimate for a follow-up" : "Request a follow-up"}
                <Icon name="arrowDown" size={18} />
              </a>
              <a className="link-quiet" href={PREAPPROVAL_LINK}>
                Or get pre-approved online
                <Icon name="external" size={16} />
                <span className="sr-only"> (opens the lender's site)</span>
              </a>
            </>
          ) : (
            <p className="btn-disabled">This property state is not eligible through this site.</p>
          )}

          <details className="calc-notes">
            <summary>Funding timing and credit notes</summary>
            <p>
              <strong>Fast funding note:</strong> {summary.fastFundingMessage}
            </p>
            <p>
              <strong>Credit insight:</strong> {summary.creditMessage}
            </p>
            <p>
              Estimates are for educational purposes only. Final line amount,
              eligibility, pricing, timing, and appraisal requirements depend on lender
              guidelines, state eligibility, title, valuation method, credit, property
              review, and underwriting.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
