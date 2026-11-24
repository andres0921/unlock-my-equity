import { GUIDES, PHONE, PREAPPROVAL_LINK } from "./site";

/* Line icons drawn on a 24px grid with square caps, to match the panels. */
const GLYPHS = {
  check: <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />,
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowDown: <path d="M12 4v15M6 13l6 6 6-6" />,
  external: (
    <>
      <path d="M13 4h7v7M20 4l-9 9" />
      <path d="M17 13.5V20H4V7h6.5" />
    </>
  ),
  phone: (
    <path d="M7 3.5h3l1.5 4.5-2.2 1.4a11 11 0 005.3 5.3l1.4-2.2 4.5 1.5v3a2 2 0 01-2.1 2A16 16 0 015 5.6a2 2 0 012-2.1z" />
  ),
  alert: (
    <>
      <path d="M12 3.5l9 16H3l9-16z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  info: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M12 11v6M12 7.6v.3" />
    </>
  ),
  plus: <path d="M12 4.5v15M4.5 12h15" />,
  hammer: (
    <>
      <path d="M4 20l9-9" />
      <path d="M11 6.5l3-3 6.5 6.5-3 3z" />
    </>
  ),
  stack: (
    <>
      <path d="M3.5 8L12 4l8.5 4-8.5 4z" />
      <path d="M3.5 12.5L12 16.5l8.5-4M3.5 16.5L12 20.5l8.5-4" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5V8l7-4v16.5M11 9h9v11.5" />
      <path d="M2.5 20.5h19M7 10v.5M7 14v.5M15 13h1.5M15 16.5h1.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
      <path d="M9 7.5V4.5h6v3M3.5 12.5h17" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v6c0 4.3-3.2 7.7-7.5 9-4.3-1.3-7.5-4.7-7.5-9V6z" />
      <path d="M8.8 12l2.3 2.3 4.2-4.3" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11L12 4l8.5 7" />
      <path d="M6 9v11h12V9M10 20v-5.5h4V20" />
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
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  );
}

/**
 * Responsive webp photo from the PHOTOS table in site.js. All photos sit below
 * the fold, so they lazy-load. width/height reserve space (no layout shift).
 */
export function Photo({ photo, sizes, alt = photo.alt, className }) {
  const largest = photo.widths[photo.widths.length - 1];
  return (
    <img
      className={className}
      src={`/images/${photo.name}-${largest}.webp`}
      srcSet={photo.widths.map((w) => `/images/${photo.name}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}

/* Brand mark: a lime tile with a house and keyhole, drawn in code. */
function BrandMark() {
  return (
    <svg className="brand-mark" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="6" fill="#AFF653" />
      <path d="M7 15.5L16 8l9 7.5V25H7z" fill="none" stroke="#101A35" strokeWidth="2.4" strokeLinejoin="miter" />
      <circle cx="16" cy="16.6" r="2.3" fill="#101A35" />
      <path d="M14.9 17.6h2.2l.6 4.4h-3.4z" fill="#101A35" />
    </svg>
  );
}

/**
 * Compact navy masthead bar used on every page. On the homepage nav anchors
 * stay in-page; on guides they point back to the homepage.
 */
export function SiteHeader({ home = false, current }) {
  const base = home ? "" : "/";
  return (
    <header className="masthead-bar">
      <div className="wrap bar-inner">
        <a href={home ? "#top" : "/"} className="brand" aria-label="Unlock My Equity USA, home">
          <BrandMark />
          <span className="brand-word">
            Unlock My Equity <span>USA</span>
          </span>
        </a>
        <nav className="bar-nav" aria-label="Main">
          <a href={`${base}#how-it-works`}>How it works</a>
          {GUIDES.map((g) => (
            <a key={g.path} href={g.path} aria-current={g.path === current ? "page" : undefined}>
              {g.label}
            </a>
          ))}
          <a href={`${base}#faq`}>FAQ</a>
        </nav>
        <div className="bar-actions">
          <a className="bar-phone" href={PHONE.href} aria-label={`Call or text ${PHONE.display}`}>
            <Icon name="phone" size={18} />
            <span className="bar-phone-text">{PHONE.display}</span>
          </a>
          <a className="btn btn-outline-lime btn-sm bar-preapprove" href={PREAPPROVAL_LINK}>
            Get pre-approved
          </a>
        </div>
      </div>
    </header>
  );
}
