import { useEffect, useState } from "react";
import {
  GUIDES,
  NMLS_CONSUMER_ACCESS_LINK,
  PHONE,
  PREAPPROVAL_LINK,
  PRIVACY_POLICY_LINK,
  SITE_NAME,
  TERMS_OF_SERVICE_LINK,
  TEXAS_NOTICE_LINK,
} from "./site";
import { Icon } from "./ui";

/**
 * Mobile-only sticky CTA. It scrolls to the calculator and hides itself while
 * the hero CTA, the calculator, the lead form, or the footer disclosures are
 * on screen, so it never covers a field or legal text.
 */
function StickyCta({ home }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = [".hero-ctas", "#calculator", "#next-step", ".site-footer"]
      .map((s) => document.querySelector(s))
      .filter(Boolean);
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sticky-cta ${hidden ? "is-hidden" : ""}`}>
      <a className="btn btn-primary btn-lg" href={home ? "#calculator" : "/#calculator"}>
        Estimate my HELOC
      </a>
      <a className="sticky-call" href={PHONE.href} aria-label={`Call or text ${PHONE.display}`}>
        <Icon name="phone" size={20} />
      </a>
    </div>
  );
}

export function Footer({ home = false }) {
  return (
    <>
      <footer className="site-footer" id="footer">
        <div className="container footer-grid">
          <div className="footer-column footer-brand-column">
            <h2 className="footer-title">{SITE_NAME}</h2>
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
            <h3>Guides</h3>
            <div className="footer-links">
              <a href="/#calculator">HELOC Calculator</a>
              {GUIDES.map((g) => (
                <a key={g.path} href={g.path}>
                  {g.label}
                </a>
              ))}
              <a href={PREAPPROVAL_LINK}>Get Pre-Approved</a>
            </div>

            <h3 className="footer-subhead">Legal</h3>
            <div className="footer-links">
              <a href={PRIVACY_POLICY_LINK} target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              <a href={TERMS_OF_SERVICE_LINK} target="_blank" rel="noreferrer">
                Terms of Use
              </a>
              <a href={NMLS_CONSUMER_ACCESS_LINK} target="_blank" rel="noreferrer">
                NMLS Consumer Access
              </a>
              <a href={TEXAS_NOTICE_LINK} target="_blank" rel="noreferrer">
                Texas Complaint &amp; Recovery Fund Notice
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Licensing</h3>
            <div className="footer-license-list">
              <div>NEXA Mortgage</div>
              <div>Corporate NMLS: #1660690</div>
              <div>Andres Aviles NMLS: #2640511</div>
              <div>5559 S Sossaman Rd Bldg #1 Ste #101</div>
              <div>Mesa AZ 85212</div>
            </div>
            <a className="footer-phone" href={PHONE.href}>
              <Icon name="phone" size={16} />
              {PHONE.display}
            </a>
          </div>
        </div>

        <div className="container footer-disclosure-block">
          <p>
            This site is not authorized by the New York State Department of Financial
            Services. No mortgage loan applications for properties located in the State
            of New York will be accepted through this site.
          </p>
          <p>
            An AXEN HELOC is secured with your home as collateral, whereas personal loans
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
          <div className="eho">
            <Icon name="home" size={18} />
            Equal Housing Opportunity
          </div>
        </div>
      </footer>

      <StickyCta home={home} />
    </>
  );
}
