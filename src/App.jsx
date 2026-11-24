import { Calculator } from "./Calculator";
import { useEstimate } from "./estimate";
import { Footer } from "./Footer";
import { LeadForm } from "./LeadForm";
import { FAQS, GUIDES, PHONE, PHOTOS, PREAPPROVAL_LINK } from "./site";
import { Icon, Photo, SiteHeader } from "./ui";

const HOW_STEPS = [
  {
    title: "Run the estimate",
    text: "Enter your home value and what you owe. The estimate updates as you type, and no contact details are needed to see it.",
  },
  {
    title: "Talk it through",
    text: "Send a follow-up request and Andres Aviles (NMLS #2640511) will reach out by phone, text, or email to go over your numbers and options.",
  },
  {
    title: "Check your rate",
    text: "Checking your rate starts with a soft credit pull that doesn't affect your score. A full application requires a hard credit pull.",
  },
];

const USES = [
  {
    icon: "hammer",
    title: "Home improvements",
    text: "Renovate, upgrade, repair, or expand your home while putting your equity back into the property.",
  },
  {
    icon: "stack",
    title: "Debt consolidation",
    text: "Replace higher-interest balances with a more structured strategy and free up room in your monthly budget.",
  },
  {
    icon: "building",
    title: "Real estate investing",
    text: "Use your equity for down payments, rehab capital, or reserves for your next investment move.",
  },
  {
    icon: "briefcase",
    title: "Business liquidity",
    text: "Create flexible capital for growth, opportunity, cash flow, or strategic business needs.",
  },
];

// Guide list thumbnails (also each guide's social image, see routes.js).
const GUIDE_META = {
  "/how-a-heloc-works": {
    photo: PHOTOS.paperwork,
    kicker: "HELOC basics",
    dek: "How much you can borrow, the draw and repayment periods, how the rate works, approval, and taxes.",
  },
  "/heloc-vs-cash-out-refinance": {
    photo: PHOTOS.renovation,
    kicker: "Compare your options",
    dek: "What happens to your current mortgage, rates, costs, and payments with each option.",
  },
};

export default function App() {
  const calc = useEstimate();
  const { summary, values, leadEstimate, isIneligibleState } = calc;

  return (
    <div className="site" id="top">
      <a className="skip-link" href="#calculator">
        Skip to the HELOC calculator
      </a>

      {/* ---------- Masthead: headline + calculator ---------- */}
      <div className="hero on-dark">
        <SiteHeader home />
        <div className="wrap hero-grid">
          <div className="hero-head">
            <p className="kicker">Home equity line of credit</p>
            <h1>Get cash from your home equity. Keep your first mortgage.</h1>
            <p className="hero-sub">
              Estimate your HELOC from your home value and what you owe. No contact
              details needed to see it.
            </p>
          </div>

          <Calculator calc={calc} />

          <div className="hero-more">
            <ul className="ticks">
              <li>
                <Icon name="check" size={18} />
                Your first mortgage, and its rate, stay in place
              </li>
              <li>
                <Icon name="check" size={18} />
                Funding in as little as 5 business days in some scenarios*
              </li>
              <li>
                <Icon name="check" size={18} />
                Checking your rate starts with a soft credit pull
              </li>
            </ul>
            <p className="hero-foot">
              *Fast-close and no-appraisal options depend on state, property type, title,
              county recording rules, valuation eligibility, remote online notarization
              availability, and final underwriting review.
            </p>
            <p className="hero-links">
              {!isIneligibleState && (
                <a href={PREAPPROVAL_LINK}>
                  Get pre-approved online
                  <Icon name="arrowRight" size={16} />
                </a>
              )}
              <a href={PHONE.href}>
                Call or text {PHONE.display}
                <Icon name="arrowRight" size={16} />
              </a>
            </p>
          </div>
        </div>
      </div>

      <main>
        {/* ---------- Lead form ---------- */}
        <section className="band band-ice" id="next-step" aria-labelledby="lead-title">
          <div className="narrow">
            <p className="kicker">Next step</p>
            <h2 id="lead-title">Talk through your numbers</h2>
            <p className="lede">
              Send your details and Andres will personally reach out. No pressure at
              all.
            </p>

            {leadEstimate ? (
              <div className="carry" aria-label="Your estimate, included with this request">
                <div className="carry-main">
                  <span className="carry-label">Your estimate, included</span>
                  <span className="carry-value">{summary.estimatedLine}</span>
                </div>
                <dl className="carry-facts">
                  <div>
                    <dt>Home value</dt>
                    <dd>{summary.homeValue}</dd>
                  </div>
                  <div>
                    <dt>Owed</dt>
                    <dd>{summary.mortgageOwed}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{summary.propertyTypeLabel}</dd>
                  </div>
                  <div>
                    <dt>Credit</dt>
                    <dd>{values.creditRange}</dd>
                  </div>
                </dl>
                <p className="carry-note">
                  Illustrative estimate only. Not a commitment to lend.
                </p>
                <a className="carry-edit" href="#calculator">
                  Edit
                </a>
              </div>
            ) : (
              <p className="carry carry-empty">
                <Icon name="info" size={18} />
                <span>
                  Optional: <a href="#calculator">run the calculator</a> and pick a credit
                  range, and your estimate is included with your request.
                </span>
              </p>
            )}

            <div className="panel">
              <LeadForm estimate={leadEstimate} suggestedState={values.propertyState} />
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="band" id="how-it-works" aria-labelledby="how-title">
          <div className="wrap">
            <div className="band-head">
              <p className="kicker">How it works</p>
              <h2 id="how-title">Three steps, at your pace</h2>
            </div>
            <ol className="steps">
              {HOW_STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="step-num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Ways to use equity ---------- */}
        <section className="band band-ice" id="uses" aria-labelledby="uses-title">
          {/* id="benefits" keeps older /#benefits campaign links working. */}
          <div className="wrap uses" id="benefits">
            <figure className="uses-photo">
              <Photo
                photo={PHOTOS.home}
                sizes="(min-width: 1024px) 440px, calc(100vw - 32px)"
              />
            </figure>
            <div className="uses-body">
              <p className="kicker">Ways homeowners use equity</p>
              <h2 id="uses-title">Put it toward things that last</h2>
              <p className="lede">
                A HELOC can be a smart tool when it creates value, improves cash flow, or
                strengthens your overall position.
              </p>
              <ul className="uses-list">
                {USES.map((u) => (
                  <li key={u.title}>
                    <span className="uses-icon" aria-hidden="true">
                      <Icon name={u.icon} size={22} />
                    </span>
                    <div>
                      <h3>{u.title}</h3>
                      <p>{u.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="notice notice-info uses-wise">
                <Icon name="shield" size={18} />
                <span>
                  We generally do <strong>not</strong> recommend using a HELOC for a car,
                  a vacation, or short-term lifestyle spending. Since your home secures
                  the line, it is usually better used for things that create lasting
                  value or improve your financial position.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- HELOC vs refinance ---------- */}
        <section className="band compare on-dark" id="borrow-better" aria-labelledby="compare-title">
          <div className="compare-photo" aria-hidden="true">
            <Photo photo={PHOTOS.home} alt="" sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          <div className="wrap compare-inner">
            <div className="compare-copy">
              <p className="kicker">A better way to borrow</p>
              <h2 id="compare-title">Get cash without starting your mortgage over</h2>
              <p>
                If you already have a strong first mortgage, a HELOC can let you access
                cash without refinancing out of it. That can make a big difference in
                today's rate environment.
              </p>
            </div>
            <div className="panel compare-panel">
              <table className="table">
                <caption className="sr-only">HELOC compared with a cash-out refinance</caption>
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
                    <td>
                      What you draw on the line. Some HELOCs, including the one
                      offered here, draw the full line at origination.
                    </td>
                    <td>Your entire new balance</td>
                  </tr>
                  <tr>
                    <th scope="row">Which costs less</th>
                    <td colSpan={2}>
                      Depends on your rates, fees and total borrowing costs for each
                      option.
                    </td>
                  </tr>
                </tbody>
              </table>
              <a className="link-arrow" href="/heloc-vs-cash-out-refinance">
                Read the full comparison
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="band band-flush" id="faq" aria-labelledby="faq-title">
          <div className="wrap band-head">
            <p className="kicker">Frequently asked questions</p>
            <h2 id="faq-title">Before you move forward</h2>
            <p className="lede">
              Still curious? Call or text <a href={PHONE.href}>{PHONE.display}</a>.
            </p>
          </div>
          <div className="rows">
            {FAQS.map((faq) => (
              <details key={faq.question} className="row">
                <summary>
                  <span className="wrap row-q">
                    <span>{faq.question}</span>
                    <Icon name="plus" size={20} className="row-icon" />
                  </span>
                </summary>
                <div className="wrap row-a">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ---------- Guides ---------- */}
        <section className="band" id="guides" aria-labelledby="guides-title">
          <div className="wrap">
            <div className="band-head">
              <p className="kicker">Guides</p>
              <h2 id="guides-title">Read before you borrow</h2>
            </div>
            <ul className="editorial">
              {GUIDES.map((g) => {
                const meta = GUIDE_META[g.path];
                return (
                  <li key={g.path}>
                    <a href={g.path} className="ed-item">
                      <span className="ed-thumb">
                        <Photo
                          photo={meta.photo}
                          alt=""
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 200px, 112px"
                        />
                      </span>
                      <span className="ed-text">
                        <span className="ed-kicker">{meta.kicker}</span>
                        <span className="ed-title">{g.label}</span>
                        <span className="ed-dek">{meta.dek}</span>
                      </span>
                      <Icon name="arrowRight" size={22} className="ed-arrow" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <Footer home />
    </div>
  );
}
