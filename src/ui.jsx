import { useEffect, useState } from "react";
import { GUIDES, PHONE } from "./site";

/* Rounded line icons drawn in code. Decorative by default (aria-hidden). */
const PATHS = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4-1.9 1.3a11 11 0 005.5 5.5l1.3-1.9 4 1.4v2.6a2 2 0 01-2.2 2A16.5 16.5 0 014.6 5.7a2 2 0 012-2.2z" />
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6 9.5V19a1 1 0 001 1h3.5v-5h3v5H17a1 1 0 001-1V9.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  hammer: (
    <>
      <path d="M13.5 6.5l4 4M4 20l9.2-9.2" />
      <path d="M11 4.5c2.2-1.4 5-1 6.8.8l1.7 1.7-3.5 3.5-5-5z" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18M7 14.5h4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3 12.5h18" />
    </>
  ),
  chat: <path d="M20 12a7.5 7.5 0 01-11 6.6L4 20l1.4-4.6A7.5 7.5 0 1120 12z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
};

export function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Photo from /public/images. Every file ships at 480, 768 and 1024px wide.
 * Square accents (house, handle) are 1:1; interior scenes are 4:3.
 * Width/height are always set so the browser reserves space (no layout shift).
 */
export function Illo({ name, alt = "", sizes, square = false, eager = false, className }) {
  const h = (w) => (square ? w : (w * 3) / 4);
  return (
    <img
      className={className}
      src={`/images/${name}-768.webp`}
      srcSet={[480, 768, 1024].map((w) => `/images/${name}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={1024}
      height={h(1024)}
      alt={alt}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
    />
  );
}

/* Simple house mark drawn in code for the header wordmark. */
function BrandMark() {
  return (
    <svg
      className="brand-mark"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="36" height="36" rx="9" fill="#205447" />
      <path
        d="M9.5 17.5L18 10.5l8.5 7M12 15.8V25.5h12v-9.7"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 25.5v-5h4v5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Header shared by every page. Not sticky, so the whole first phone screen
 * goes to the headline and the form; the mobile sticky bar takes over later.
 */
export function SiteHeader({ home = false, current }) {
  const base = home ? "" : "/";
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href={home ? "#top" : "/"} className="brand" aria-label="Unlock My Equity USA, home">
          <BrandMark />
          <span className="brand-word">
            Unlock My Equity <span>USA</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Main">
          <a href={`${base}#calculator`}>Calculator</a>
          <a href={`${base}#how-it-works`}>How it works</a>
          {GUIDES.map((g) => (
            <a
              key={g.path}
              href={g.path}
              aria-current={g.path === current ? "page" : undefined}
            >
              {g.label}
            </a>
          ))}
          <a href={`${base}#faq`}>FAQ</a>
        </nav>

        <a className="header-phone" href={PHONE.href} aria-label={`Call or text ${PHONE.display}`}>
          <Icon name="phone" size={18} />
          <span className="header-phone-text">{PHONE.display}</span>
        </a>
      </div>
    </header>
  );
}

/**
 * Mobile-only sticky bar. Hides while any form, the calculator, or the footer
 * disclosures are on screen, and while a form field has focus (so it never
 * sits on top of the on-screen keyboard or a field being filled in).
 */
export function StickyCta() {
  const [inView, setInView] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const targets = ["#next-step", "#calculator", ".guide-hero-ctas", ".site-footer"]
      .map((s) => document.querySelector(s))
      .filter(Boolean);
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setInView(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));

    const isField = (el) => el && el.matches?.("input, select, textarea");
    const onIn = (e) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      io.disconnect();
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  const hidden = inView || typing;
  return (
    <div className={`sticky-cta ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden || undefined}>
      <a
        className="btn btn-primary"
        href="#next-step"
        tabIndex={hidden ? -1 : undefined}
      >
        Start my HELOC request
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
