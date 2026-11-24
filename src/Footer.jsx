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

const FIELD_SELECTOR = "input, select, textarea";
const ACTION_SELECTOR = [
  ".calc-inputs .money",
  ".calc-act .btn",
  ".calc-act .btn-disabled",
  ".hero-links",
  ".guide-mast .btn",
  "#next-step .panel",
  ".site-footer",
].join(", ");

/**
 * Mobile-only sticky CTA. It stays out of the way while the calculator inputs
 * or buttons, a page CTA, the lead form or the footer disclosures are on screen, and while any form field
 * has focus (so it never sits on top of the on-screen keyboard).
 */
function StickyCta({ home }) {
  const [inView, setInView] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onIn = (e) => setTyping(Boolean(e.target.closest?.(FIELD_SELECTOR)));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);

    let io;
    if (typeof IntersectionObserver !== "undefined") {
      // Hide only while a real action control is on screen (the calculator's
      // money inputs and buttons, the hero/guide CTAs, the lead form), plus the
      // footer disclosures. Watching whole sections hid it for far too long.
      const targets = Array.from(document.querySelectorAll(ACTION_SELECTOR));
      const visible = new Set();
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setInView(visible.size > 0);
      });
      targets.forEach((t) => io.observe(t));
    }
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      io?.disconnect();
    };
  }, []);

  const hidden = inView || typing;
  return (
    <div className={`sticky-cta ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden || undefined}>
      <a
        className="btn btn-primary"
        href={home ? "#calculator" : "/#calculator"}
        tabIndex={hidden ? -1 : undefined}
      >
        Estimate my HELOC
      </a>
      <a
        className="sticky-call"
        href={PHONE.href}
        aria-label={`Call or text ${PHONE.display}`}
        tabIndex={hidden ? -1 : undefined}
      >
        <Icon name="phone" size={20} />
      </a>
    </div>
  );
}

export function Footer({ home = false }) {
  return (
    <>
      <footer className="site-footer" id="footer">
        <div className="wrap footer-grid">
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

        <div className="wrap footer-disclosure-block">
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

        <div className="wrap footer-bottom">
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
