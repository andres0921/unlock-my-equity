import { Footer } from "./Footer";
import { LeadForm } from "./LeadForm";
import { GUIDES, PREAPPROVAL_LINK } from "./site";
import { HOW_HELOC_FAQS, VS_REFI_FAQS } from "./guideFaqs";

const SOURCES = {
  cfpbHeloc: {
    label: "CFPB: What is a home equity line of credit (HELOC)?",
    href: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-heloc-en-107/",
  },
  irs936: {
    label: "IRS Publication 936: Home Mortgage Interest Deduction",
    href: "https://www.irs.gov/publications/p936",
  },
  cashOut: {
    label: "Navy Federal Credit Union: How a cash-out refinance works",
    href: "https://www.navyfederal.org/makingcents/home-ownership/cash-out-refinance/",
  },
};

function GuideLayout({ eyebrow, title, intro, children, sources, current }) {
  return (
    <div className="site-shell">
      <header className="hero guide-hero" id="top">
        <div className="container">
          <nav className="nav">
            <a href="/" className="brand brand-link">
              <img src="/logo.png" alt="Unlock My Equity USA" className="brand-logo" />
            </a>
            <div className="nav-links">
              <a href="/#calculator">Calculator</a>
              {GUIDES.map((g) => (
                <a
                  key={g.path}
                  href={g.path}
                  aria-current={g.path === current ? "page" : undefined}
                >
                  {g.label}
                </a>
              ))}
              <a href="/#faq">FAQ</a>
            </div>
            <a className="nav-cta" href={PREAPPROVAL_LINK}>
              Get Pre-Approved
            </a>
          </nav>

          <div className="guide-heading">
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p className="hero-text">{intro}</p>
          </div>
        </div>
      </header>

      <main>
        <article className="container guide-body">{children}</article>

        <section className="lead-section" id="next-step">
          <div className="container">
            <div className="lead-box">
              <div className="lead-copy">
                <div className="eyebrow">Take the next step</div>
                <h2>Want to see what your numbers look like?</h2>
                <p>
                  Run the <a href="/#calculator">HELOC calculator</a> for a quick
                  estimate, or send me your details and we'll take a step back and look
                  at your options together. No pressure at all.
                </p>
              </div>
              <div className="lead-form-card">
                <LeadForm />
              </div>
            </div>
          </div>
        </section>

        <section className="container guide-sources">
          <h2>Sources</h2>
          <ul>
            {sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="fine-print">
            This guide is general education, not tax or legal advice. Loan programs,
            limits, and pricing vary by lender, state, and borrower and can change.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}


export function HowAHelocWorks() {
  return (
    <GuideLayout
      current="/how-a-heloc-works"
      eyebrow="HELOC basics"
      title="How a HELOC works, in plain English"
      intro="A home equity line of credit lets you borrow against the equity you've built, without replacing the mortgage you already have. Here's how it actually works, step by step."
      sources={[SOURCES.cfpbHeloc, SOURCES.irs936]}
    >
      <section>
        <h2>Start with your equity</h2>
        <p>
          Equity is what your home is worth minus what you still owe on it. If your
          home is worth $500,000 and you owe $250,000, you have $250,000 in equity.
        </p>
        <p>
          Lenders don't let you borrow all of it. They cap the total of every loan on
          the home at a percentage of its value, called the combined loan-to-value
          (CLTV). The estimates in our calculator use up to 80% for a primary residence
          and 75% for an investment property. In the example above, 80% of $500,000 is
          $400,000. Subtract the $250,000 you owe and the estimated line is about
          $150,000.
        </p>
        <p>
          <a href="/#calculator">Try the calculator with your own numbers</a>.
        </p>
      </section>

      <section>
        <h2>The draw period and the repayment period</h2>
        <p>
          Most HELOCs have two phases. During the <strong>draw period</strong>, which
          can last up to about 10 years, you can borrow against your line. When it
          ends, you can no longer borrow, and the <strong>repayment period</strong>{" "}
          begins, often lasting 10 to 20 years. Payments are frequently higher in
          repayment, so it's worth planning for that from day one.
        </p>
      </section>

      <section>
        <h2>How the rate works</h2>
        <p>
          Many HELOCs carry a variable rate, so the payment can change from month to
          month. Some let you lock all or part of the balance at a fixed rate.
        </p>
        <p>
          The AXEN Home Equity Line offered through this site works a little
          differently: the full line (minus the origination fee) is drawn when the loan
          closes, at a fixed rate. As you pay it down, you can draw again during the
          draw period. Each new draw is priced on the day you take it, at the Prime
          Rate plus a fixed margin, so a later draw can carry a higher rate than the
          first one.
        </p>
      </section>

      <section>
        <h2>What it takes to get approved</h2>
        <ul>
          <li>
            <strong>Equity:</strong> enough room under the CLTV limit for the line you
            want.
          </li>
          <li>
            <strong>Credit:</strong> your score affects pricing and which options are
            available.
          </li>
          <li>
            <strong>Income:</strong> verified income and employment, so the payment fits.
          </li>
          <li>
            <strong>The property:</strong> a valuation and a property condition check.
            Some files qualify without a traditional appraisal.
          </li>
        </ul>
        <p>
          Checking your rate starts with a soft credit pull that doesn't affect your
          score. If you move forward with a full application, a hard pull is required.
        </p>
      </section>

      <section>
        <h2>A quick word on taxes</h2>
        <p>
          Under IRS Publication 936, interest on a home equity loan or line is
          deductible only if the money is used to buy, build, or substantially improve
          the home that secures it. Using it to pay off credit cards, for example,
          doesn't qualify. A tax professional can tell you how this applies to you.
        </p>
      </section>

      <section>
        <h2>Use it for things that last</h2>
        <p>
          Your home secures the line, so if you can't repay it, you could lose your
          home. That's why I generally steer people toward uses that build value or
          improve their position: renovations, paying off higher-interest debt with a
          real plan, or investing. I'd skip using it for a car or a vacation.
        </p>
      </section>

      <section className="guide-faq">
        <h2>Common questions</h2>
        {HOW_HELOC_FAQS.map((f) => (
          <div key={f.question} className="guide-faq-item">
            <h3>{f.question}</h3>
            <p>{f.answer}</p>
          </div>
        ))}
      </section>

      <p className="guide-next">
        Next: <a href="/heloc-vs-cash-out-refinance">HELOC vs. cash-out refinance</a>
      </p>
    </GuideLayout>
  );
}


export function HelocVsCashOut() {
  return (
    <GuideLayout
      current="/heloc-vs-cash-out-refinance"
      eyebrow="Compare your options"
      title="HELOC vs. cash-out refinance: which fits you?"
      intro="Both turn your home equity into cash. The biggest difference is what happens to the mortgage you already have, and that one detail can change the whole math."
      sources={[SOURCES.cashOut, SOURCES.cfpbHeloc]}
    >
      <section>
        <h2>The short version</h2>
        <p>
          A <strong>cash-out refinance</strong> replaces your current mortgage with a
          new, bigger loan and pays you the difference. A <strong>HELOC</strong> leaves
          your mortgage alone and adds a separate line of credit behind it.
        </p>
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">HELOC</th>
                <th scope="col">Cash-out refinance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Your current mortgage</th>
                <td>Stays in place, rate and all</td>
                <td>Paid off and replaced by a new loan</td>
              </tr>
              <tr>
                <th scope="row">The new rate applies to</th>
                <td>Only what you borrow on the line</td>
                <td>Your entire new balance</td>
              </tr>
              <tr>
                <th scope="row">Up-front costs</th>
                <td>Vary by product and lender</td>
                <td>Often about 2% to 5% of the loan amount</td>
              </tr>
              <tr>
                <th scope="row">Payments</th>
                <td>Your existing mortgage plus the line</td>
                <td>One new mortgage payment</td>
              </tr>
              <tr>
                <th scope="row">Often a fit when</th>
                <td>Your first mortgage rate is low</td>
                <td>Today's rates beat your current rate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Why your current rate matters so much</h2>
        <p>
          With a cash-out refinance, the new rate applies to everything you owe, not
          just the cash you take out. If your current mortgage has a lower rate than
          what's available today, refinancing means giving up that rate on your whole
          balance to access a smaller amount of cash.
        </p>
        <p>
          A HELOC avoids that. Your first mortgage keeps its rate, and only the money
          you borrow on the line is priced at today's terms. For a lot of homeowners
          with a low first mortgage, that's the deciding factor.
        </p>
      </section>

      <section>
        <h2>When a cash-out refinance can still win</h2>
        <ul>
          <li>Today's rates are at or below your current mortgage rate.</li>
          <li>You want one predictable payment instead of two.</li>
          <li>You need a large amount and plan to stay in the home a long time.</li>
        </ul>
      </section>

      <section>
        <h2>When a HELOC usually makes more sense</h2>
        <ul>
          <li>Your first mortgage rate is lower than today's rates.</li>
          <li>You need a specific amount for a project, not a whole new loan.</li>
          <li>You want to avoid the closing costs of a full refinance.</li>
        </ul>
      </section>

      <section>
        <h2>Let's look at your real numbers</h2>
        <p>
          The honest answer is that it depends on your rate, your balance, how much
          you need, and how long you plan to stay. I'm happy to run both side by side
          so you can see which one actually costs less for you.
        </p>
      </section>

      <section className="guide-faq">
        <h2>Common questions</h2>
        {VS_REFI_FAQS.map((f) => (
          <div key={f.question} className="guide-faq-item">
            <h3>{f.question}</h3>
            <p>{f.answer}</p>
          </div>
        ))}
      </section>

      <p className="guide-next">
        Next: <a href="/how-a-heloc-works">How a HELOC works</a>
      </p>
    </GuideLayout>
  );
}
