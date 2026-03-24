import React, { useMemo, useState } from "react";
import "./index.css";

const PREAPPROVAL_LINK =
  "https://axenmortgageheloc.com/account/heloc/register?referrer=45c7a24f-ed59-4272-9b9c-65d3850bc9b8";

const NMLS_CONSUMER_ACCESS_LINK =
  "https://nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/COMPANY/1660690";

const TEXAS_NOTICE_LINK =
  "https://acrobat.adobe.com/id/urn:aaid:sc:US:9d6a8f3f-a8e0-4c41-95c5-45bc4c8c2845";

const PRIVACY_POLICY_LINK = "https://axenmortgage.com/privacy-policy-2/";
const TERMS_OF_SERVICE_LINK = "https://axenmortgageheloc.com/terms";

const STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const QUICK_TURN_STATES = [
  "Arizona",
  "California",
  "Colorado",
  "Florida",
  "Idaho",
  "Nevada",
  "Oregon",
  "Texas",
  "Utah",
  "Washington",
];

const INELIGIBLE_STATES = ["Massachusetts", "New York"];

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

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-question" onClick={onClick} type="button">
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [homeValue, setHomeValue] = useState("");
  const [mortgageOwed, setMortgageOwed] = useState("");
  const [occupancyType, setOccupancyType] = useState("owner");
  const [creditRange, setCreditRange] = useState("");
  const [propertyState, setPropertyState] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  const parsedHomeValue = parseCurrency(homeValue);
  const parsedMortgageOwed = parseCurrency(mortgageOwed);

  const maxLtv = occupancyType === "owner" ? 0.8 : 0.75;
  const estimatedLine = Math.max(parsedHomeValue * maxLtv - parsedMortgageOwed, 0);
  const isIneligibleState = INELIGIBLE_STATES.includes(propertyState);

  const canContinueStep1 =
    parsedHomeValue > 0 &&
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

  const faqs = [
    {
      question: "How much cash can I get from my home?",
      answer:
        "Your available HELOC amount depends on your home value, your current mortgage balance, occupancy type, credit profile, and product guidelines. This calculator gives you a fast estimate based on those factors.",
    },
    {
      question: "How fast can I get approved and funded?",
      answer:
        "Some borrowers may qualify for approval in minutes and funding in as little as 5 business days. Timing depends on state, title, property review, county recording rules, remote online notarization, and underwriting.",
    },
    {
      question: "What are the best ways to use a HELOC?",
      answer:
        "Many borrowers use a HELOC for home improvements, debt consolidation, real estate investing, business liquidity, and major planned expenses. We generally do not recommend using a HELOC for a car or vacation.",
    },
    {
      question: "Will checking my options hurt my credit?",
      answer:
        "Checking your options may involve a soft credit pull that does not affect your score. If you move forward and complete a full application, a hard credit inquiry may be required.",
    },
  ];

  function nextStep() {
    if (step === 1 && !canContinueStep1) return;
    if (step === 2 && !canContinueStep2) return;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  return (
    <div className="site-shell">
      <header className="hero" id="top">
        <div className="container">
          <nav className="nav">
            <a href="#top" className="brand brand-link">
              <img
                src="/logo.png"
                alt="Unlock My Equity USA"
                className="brand-logo"
              />
            </a>

            <div className="nav-links">
              <a href="#calculator">Calculator</a>
              <a href="#benefits">Benefits</a>
              <a href="#uses">Uses</a>
              <a href="#faq">FAQ</a>
            </div>

            <a className="nav-cta" href={PREAPPROVAL_LINK}>
              Get Pre-Approved
            </a>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">Unlock the cash already in your home</div>
              <h1>Access your equity without touching your low first mortgage.</h1>
              <p className="hero-text">
                Need cash for home improvements, debt payoff, investing, or major
                expenses? A HELOC can give you fast access to your home’s equity so you
                can move forward with confidence.
              </p>

              <div className="hero-highlights">
                <div className="highlight-card">See your estimated borrowing power fast</div>
                <div className="highlight-card">Keep your current first mortgage in place</div>
                <div className="highlight-card">
                  Get funded in as little as 5 business days in some scenarios
                </div>
              </div>

              <p className="hero-disclaimer">
                Fast-close and no-appraisal options depend on state, property type,
                title, county recording rules, valuation eligibility, remote online
                notarization availability, and final underwriting review.
              </p>
            </div>

            <div className="calculator-panel" id="calculator">
              <div className="calculator-top">
                <div className="calculator-label">HELOC Calculator</div>
                <h2>See how much cash you may be able to unlock</h2>
                <p>
                  Answer a few quick questions to estimate your available HELOC amount.
                </p>
              </div>

              <div className="progress-bar-wrap">
                {[1, 2, 3].map((item, index) => (
                  <React.Fragment key={item}>
                    <div className={`progress-dot ${step >= item ? "active" : ""}`}>
                      {item}
                    </div>
                    {index < 2 && (
                      <div className={`progress-line ${step > item ? "active" : ""}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {step === 1 && (
                <div className="step-panel">
                  <div className="input-group">
                    <label>What is your home worth?</label>
                    <div className="currency-input">
                      <span>$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="500,000"
                        value={homeValue}
                        onChange={(e) => setHomeValue(formatNumberInput(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>How much do you still owe?</label>
                    <div className="currency-input">
                      <span>$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="250,000"
                        value={mortgageOwed}
                        onChange={(e) =>
                          setMortgageOwed(formatNumberInput(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="helper-box">
                    We’ll use these numbers to estimate how much equity you may be able
                    to turn into available cash.
                  </div>

                  {!canContinueStep1 && homeValue && mortgageOwed && (
                    <div className="warning-box">
                      Your home value should be greater than your mortgage balance for a
                      meaningful HELOC estimate.
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="step-panel">
                  <div className="input-group">
                    <label>What type of property do you have?</label>
                    <div className="option-grid">
                      <button
                        type="button"
                        className={`option-card ${
                          occupancyType === "owner" ? "selected" : ""
                        }`}
                        onClick={() => setOccupancyType("owner")}
                      >
                        <strong>Primary Residence</strong>
                        <span>Estimated max LTV: 80%</span>
                      </button>

                      <button
                        type="button"
                        className={`option-card ${
                          occupancyType === "investment" ? "selected" : ""
                        }`}
                        onClick={() => setOccupancyType("investment")}
                      >
                        <strong>Investment Property</strong>
                        <span>Estimated max LTV: 75%</span>
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>What is your estimated credit score?</label>
                    <select
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

                  <div className="helper-box">
                    Your credit profile helps determine your pricing, approval strength,
                    and available HELOC options.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-panel">
                  <div className="result-card">
                    <div className="result-label">Estimated Available HELOC</div>
                    <div className="result-value">{resultSummary.estimatedLine}</div>
                    <p className="result-meta">
                      Based on a {resultSummary.ltvLabel} estimated maximum LTV, a home
                      value of {resultSummary.homeValue}, and current mortgage balances of{" "}
                      {resultSummary.mortgageOwed}.
                    </p>
                  </div>

                  <div className="summary-grid">
                    <div className="summary-box">
                      <span>Property Type</span>
                      <strong>{resultSummary.propertyTypeLabel}</strong>
                    </div>
                    <div className="summary-box">
                      <span>Credit Range</span>
                      <strong>{creditRange || "Not selected"}</strong>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>What state is the property in?</label>
                    <select
                      value={propertyState}
                      onChange={(e) => setPropertyState(e.target.value)}
                    >
                      <option value="">Select your state</option>
                      {STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {propertyState && (
                    <div className={isIneligibleState ? "warning-box" : "helper-box"}>
                      <strong>Eligibility:</strong> {resultSummary.eligibilityMessage}
                    </div>
                  )}

                  <div className="info-box">
                    <strong>Fast funding note:</strong> {resultSummary.fastFundingMessage}
                  </div>

                  <div className="info-box muted">
                    <strong>Credit insight:</strong> {resultSummary.creditMessage}
                  </div>

                  {!isIneligibleState ? (
                    <a className="primary-cta full-width" href={PREAPPROVAL_LINK}>
                      Get My HELOC Options
                    </a>
                  ) : (
                    <div className="disabled-cta">
                      This property state is not eligible through this site.
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

              <div className="calculator-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Back
                </button>

                {step < 3 && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !canContinueStep1) ||
                      (step === 2 && !canContinueStep2)
                    }
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="trust-section" id="benefits">
          <div className="container">
            <div className="section-heading centered">
              <div className="eyebrow dark">Why homeowners choose a HELOC</div>
              <h2>Turn your home equity into flexible cash when you need it most</h2>
              <p>
                Your equity can do more than sit there. Use it to fund the projects,
                opportunities, and financial moves that matter most to you.
              </p>
            </div>

            <div className="trust-grid">
              <div className="trust-card">
                <h3>Access More Cash</h3>
                <p>
                  Put the equity in your property to work and create borrowing power you
                  can actually use.
                </p>
              </div>
              <div className="trust-card">
                <h3>Move Fast</h3>
                <p>
                  Some borrowers may qualify for fast approvals and funding in as little
                  as 5 business days.
                </p>
              </div>
              <div className="trust-card">
                <h3>Keep Your Existing Mortgage</h3>
                <p>
                  Access cash without replacing the first mortgage you already worked hard
                  to get.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="uses-section" id="uses">
          <div className="container">
            <div className="section-heading centered">
              <div className="eyebrow dark">Popular ways borrowers use a HELOC</div>
              <h2>Use your equity for something that actually moves you forward</h2>
              <p>
                A HELOC can be a smart financial tool when you use it for goals that
                create value, improve cash flow, or strengthen your overall position.
              </p>
            </div>

            <div className="uses-grid">
              <div className="use-card">
                <div className="use-icon">🏡</div>
                <h3>Home Improvements</h3>
                <p>
                  Renovate, upgrade, repair, or expand your home while putting your
                  equity back into the property.
                </p>
              </div>

              <div className="use-card">
                <div className="use-icon">💳</div>
                <h3>Debt Consolidation</h3>
                <p>
                  Replace higher-interest balances with a more structured strategy and
                  free up room in your monthly budget.
                </p>
              </div>

              <div className="use-card">
                <div className="use-icon">📈</div>
                <h3>Real Estate Investing</h3>
                <p>
                  Use your equity for down payments, rehab capital, or reserves for your
                  next investment move.
                </p>
              </div>

              <div className="use-card">
                <div className="use-icon">💼</div>
                <h3>Business Liquidity</h3>
                <p>
                  Create flexible capital for growth, opportunity, cash flow, or strategic
                  business needs.
                </p>
              </div>
            </div>

            <div className="avoid-box">
              <h3>Use your equity wisely</h3>
              <p>
                We generally do <strong>not</strong> recommend using a HELOC for a car,
                a vacation, or short-term lifestyle spending. Since your home secures the
                line, it is usually better used for things that create lasting value or
                improve your financial position.
              </p>
            </div>
          </div>
        </section>

        <section className="speed-section" id="borrow-better">
          <div className="container speed-grid">
            <div>
              <div className="eyebrow dark">A better way to borrow</div>
              <h2>Get the money you need without starting your mortgage over</h2>
              <p className="section-copy">
                If you already have a strong first mortgage, a HELOC can let you access
                cash without refinancing out of it. That can make a huge difference in
                today’s rate environment.
              </p>
            </div>

            <div className="feature-stack">
              <div className="feature-card">
                <div className="feature-number">01</div>
                <div>
                  <h3>Fast approval potential</h3>
                  <p>
                    Some files may move quickly, with approval decisions in minutes and
                    fast funding in qualifying scenarios.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-number">02</div>
                <div>
                  <h3>No-appraisal scenarios may be available</h3>
                  <p>
                    In certain cases, your file may qualify for a valuation method that
                    avoids a traditional appraisal.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-number">03</div>
                <div>
                  <h3>Flexible access to your borrowing power</h3>
                  <p>
                    Use your equity to create breathing room, seize opportunities, or
                    tackle larger financial goals with more confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lead-section" id="next-step">
          <div className="container">
            <div className="lead-box">
              <div className="lead-copy">
                <div className="eyebrow">Take the next step</div>
                <h2>See what your home equity may be able to do for you.</h2>
                <p>
                  If you have equity in your property, now is the time to see how much
                  you may be able to access and what your HELOC options may look like.
                </p>
              </div>

              <div className="lead-form-card">
                <div className="mini-form">
                  <div className="mini-form-row">
                    <input type="text" placeholder="Full Name" />
                    <input type="email" placeholder="Email Address" />
                  </div>
                  <div className="mini-form-row">
                    <input type="tel" placeholder="Phone Number" />
                    <input type="text" placeholder="Property State" />
                  </div>
                  <a className="primary-cta full-width" href={PREAPPROVAL_LINK}>
                    Check My HELOC Options
                  </a>
                  <p className="mini-form-note">
                    Start with a quick review and see what you may qualify for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="container">
            <div className="section-heading centered">
              <div className="eyebrow dark">Frequently asked questions</div>
              <h2>What borrowers want to know before they move forward</h2>
              <p>
                Here are some of the most common questions homeowners ask before getting
                pre-approved for a HELOC.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={activeFaq === index}
                  onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta-section">
          <div className="container">
            <div className="final-cta-card">
              <div>
                <div className="eyebrow light">Ready to unlock your cash?</div>
                <h2>Get pre-approved for your HELOC today.</h2>
                <p>
                  Find out how much you may be able to access and take the next step
                  toward using your home equity with confidence.
                </p>
              </div>
              <a className="light-cta" href={PREAPPROVAL_LINK}>
                Get My HELOC Options
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="container footer-grid">
          <div className="footer-column footer-brand-column">
            <h3>Unlock My Equity USA</h3>
            <div className="footer-license-list">
              <div>NEXA Mortgage</div>
              <div>Corporate NMLS #1660690</div>
              <div>Andres Aviles NMLS #2640511</div>
              <div>NEXA Mortgage Equal Housing Lender</div>
            </div>

            <p className="footer-disclaimer">
              Unlock My Equity USA helps homeowners explore mortgage and home equity
              options through NEXA Mortgage. This website is intended for informational
              and advertising purposes only.
            </p>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <div className="footer-links">
              <a href={PRIVACY_POLICY_LINK} target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              <a href={TERMS_OF_SERVICE_LINK} target="_blank" rel="noreferrer">
                Terms of Use
              </a>
              <a
                href={NMLS_CONSUMER_ACCESS_LINK}
                target="_blank"
                rel="noreferrer"
              >
                NMLS Consumer Access
              </a>
              <a href={TEXAS_NOTICE_LINK} target="_blank" rel="noreferrer">
                Texas Complaint &amp; Recovery Fund Notice
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Licensing</h4>
            <div className="footer-license-list">
              <div>NEXA Mortgage</div>
              <div>Corporate NMLS: #1660690</div>
              <div>Andres Aviles NMLS: #2640511</div>
              <div>5559 S Sossaman Rd Bldg #1 Ste #101</div>
              <div>Mesa AZ 85212</div>
            </div>
          </div>
        </div>

        <div className="container footer-disclosure-block">
          <p>
            This site is not authorized by the New York State Department of Financial
            Services. No mortgage loan applications for properties located in the State
            of New York will be accepted through this site.
          </p>
          <p>
            A AXEN HELOC is secured with your home as collateral, whereas personal loans
            and credit cards are not.
          </p>
          <p>
            To check the rates and terms you qualify for, we will conduct a soft credit
            pull that will not affect your credit score. However, if you continue and
            submit an application, we will request your full credit report from one or
            more consumer reporting agencies, which is considered a hard credit pull and
            may affect your credit.
          </p>
          <p>
            Approval may be granted in five minutes but is ultimately subject to
            verification of income and employment, as well as verification that your
            property is in at least average condition with a property condition report.
            Five business day funding timeline assumes closing the loan with our remote
            online notary. Funding timelines may be longer for loans secured by
            properties located in counties that do not permit recording of e-signatures
            or that otherwise require an in-person closing, or that require a waiting
            period prior to closing.
          </p>
          <p>
            The AXEN Home Equity Line is an open-end product where the full loan amount
            (minus the origination fee) will be 100% drawn at the time of origination.
            The initial amount funded at origination will be based on a fixed rate;
            however, this product contains an additional draw feature. As the borrower
            repays the balance on the line, the borrower may make additional draws during
            the draw period. If the borrower elects to make an additional draw, the
            interest rate for that draw will be set as of the date of the draw and will
            be based on an Index, which is the Prime Rate published in the Wall Street
            Journal for the calendar month preceding the date of the additional draw,
            plus a fixed margin. Accordingly, the fixed rate for any additional draw may
            be higher than the fixed rate for the initial draw.
          </p>
        </div>

        <div className="container footer-bottom">
          <div>© {new Date().getFullYear()} Unlock My Equity USA. All rights reserved.</div>
        </div>
      </footer>

      <a href={PREAPPROVAL_LINK} className="mobile-sticky-cta">
        Get My HELOC Options
      </a>
    </div>
  );
}