import { GUIDES, PHONE } from "./site";

/* Simple hand-drawn line icons. Decorative by default (aria-hidden). */
const PATHS = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4-1.9 1.3a11 11 0 005.5 5.5l1.3-1.9 4 1.4v2.6a2 2 0 01-2.2 2A16.5 16.5 0 014.6 5.7a2 2 0 012-2.2z" />
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" />
    </>
  ),
  chat: (
    <path d="M20 12a7.5 7.5 0 01-11 6.6L4 20l1.4-4.6A7.5 7.5 0 1120 12z" />
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
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
  plus: <path d="M12 5v14M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
};

export function Icon({ name, size = 20, className = "", title }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  );
}

/**
 * Responsive webp photo. Every image in /public/images ships at 640 and 1024
 * widths. Pass `priority` only for the one hero image: it loads eagerly but
 * without fetchpriority="high", because on phones the hero photo sits below
 * the fold and shouldn't compete with the app bundle. On desktop, where it is
 * in view, the browser raises its priority itself once layout runs.
 */
export function Photo({ name, alt, ratio = "4:3", sizes, priority = false, className }) {
  const [w, h] = ratio === "16:9" ? [1024, 576] : [1024, 768];
  return (
    <img
      className={className}
      src={`/images/${name}-1024.webp`}
      srcSet={`/images/${name}-640.webp 640w, /images/${name}-1024.webp 1024w`}
      sizes={sizes}
      width={w}
      height={h}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
    />
  );
}

/**
 * Slim sticky header shared by every page. On the homepage the CTA scrolls
 * to the calculator; on guides it links back to it.
 */
export function SiteHeader({ home = false, current }) {
  const base = home ? "" : "/";
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href={home ? "#top" : "/"} className="brand" aria-label="Unlock My Equity USA, home">
          <img
            src="/images/logo-mark.webp"
            alt=""
            width="190"
            height="96"
            className="brand-mark"
          />
          <span className="brand-word">
            Unlock My Equity <span>USA</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Main">
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

        <div className="header-actions">
          <a
            className="header-phone"
            href={PHONE.href}
            aria-label={`Call or text ${PHONE.display}`}
          >
            <Icon name="phone" size={18} />
            <span className="header-phone-text">{PHONE.display}</span>
          </a>
          <a className="btn btn-primary btn-sm" href={`${base}#calculator`}>
            <span className="lbl-long">Estimate my HELOC</span>
            <span className="lbl-short">Get estimate</span>
          </a>
        </div>
      </div>
    </header>
  );
}
