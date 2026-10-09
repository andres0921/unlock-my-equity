import App from "./App";
import { HelocVsCashOut, HowAHelocWorks } from "./Guides";
import { HOW_HELOC_FAQS, VS_REFI_FAQS } from "./guideFaqs";
import { FAQS, SITE_NAME, SITE_URL } from "./site";

export { SITE_URL };

const LOGO = `${SITE_URL}/logo.png`;

const person = {
  "@type": "Person",
  name: "Andres Aviles",
  jobTitle: "Mortgage Loan Officer, NEXA Mortgage (NMLS #2640511)",
  url: "https://www.andresaviles.com",
  telephone: "+12149085914",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: LOGO,
  image: LOGO,
  telephone: "+12149085914",
  areaServed: { "@type": "Country", name: "United States" },
  employee: person,
  parentOrganization: { "@type": "Organization", name: "NEXA Mortgage, LLC" },
};

const faqPage = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

const crumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
  })),
});

const article = (path, headline, description) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline,
  description,
  url: `${SITE_URL}${path}`,
  inLanguage: "en-US",
  author: person,
  publisher: { "@type": "Organization", name: SITE_NAME, logo: LOGO },
  dateModified: "2026-10-09",
});

/**
 * Every page on the site. Each is pre-rendered at build time to dist/<file>
 * with its own title, description, canonical and schema (see prerender.js),
 * and the browser hydrates the matching component (see main.jsx).
 */
export const routes = [
  {
    path: "/",
    file: "index.html",
    title: "HELOC Calculator: See How Much Equity You Can Unlock | Unlock My Equity USA",
    description:
      "Estimate how much cash you could access with a HELOC while keeping your low first mortgage. Fast approvals, funding in as little as 5 business days in some scenarios. Talk with Andres Aviles, NMLS #2640511.",
    ogDescription:
      "Estimate your HELOC in under a minute and access your home equity without refinancing your first mortgage.",
    Component: App,
    jsonLd: [organization, faqPage(FAQS)],
  },
  {
    path: "/how-a-heloc-works",
    file: "how-a-heloc-works.html",
    title: "How a HELOC Works: Draw Period, Rates & Approval, Explained | Unlock My Equity USA",
    description:
      "A plain-English guide to home equity lines of credit: how much you can borrow, the draw and repayment periods, how the rate works, what it takes to get approved, and the tax rules.",
    Component: HowAHelocWorks,
    jsonLd: [
      article(
        "/how-a-heloc-works",
        "How a HELOC works, in plain English",
        "How much you can borrow, the draw and repayment periods, how the rate works, approval, and taxes."
      ),
      faqPage(HOW_HELOC_FAQS),
      crumbs([
        ["Home", "/"],
        ["How a HELOC Works", "/how-a-heloc-works"],
      ]),
    ],
  },
  {
    path: "/heloc-vs-cash-out-refinance",
    file: "heloc-vs-cash-out-refinance.html",
    title: "HELOC vs. Cash-Out Refinance: Which Is Better for You? | Unlock My Equity USA",
    description:
      "Compare a HELOC and a cash-out refinance side by side: what happens to your current mortgage and rate, up-front costs, payments, and when each one makes sense.",
    Component: HelocVsCashOut,
    jsonLd: [
      article(
        "/heloc-vs-cash-out-refinance",
        "HELOC vs. cash-out refinance: which fits you?",
        "What happens to your current mortgage, rates, costs, and payments with a HELOC versus a cash-out refinance."
      ),
      faqPage(VS_REFI_FAQS),
      crumbs([
        ["Home", "/"],
        ["HELOC vs. Cash-Out Refinance", "/heloc-vs-cash-out-refinance"],
      ]),
    ],
  },
];

export function findRoute(pathname) {
  const clean = pathname.replace(/\/+$/, "").replace(/\.html$/, "") || "/";
  return routes.find((r) => r.path === clean) ?? routes[0];
}
