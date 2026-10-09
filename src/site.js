// Shared constants for every page on unlockmyequityusa.com.

export const SITE_URL = "https://unlockmyequityusa.com";
export const SITE_NAME = "Unlock My Equity USA";

export const PREAPPROVAL_LINK =
  "https://axenmortgageheloc.com/account/heloc/register?referrer=45c7a24f-ed59-4272-9b9c-65d3850bc9b8";

export const NMLS_CONSUMER_ACCESS_LINK =
  "https://nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/COMPANY/1660690";

export const TEXAS_NOTICE_LINK =
  "https://acrobat.adobe.com/id/urn:aaid:sc:US:9d6a8f3f-a8e0-4c41-95c5-45bc4c8c2845";

export const PRIVACY_POLICY_LINK = "https://axenmortgage.com/privacy-policy-2/";
export const TERMS_OF_SERVICE_LINK = "https://axenmortgageheloc.com/terms";

/**
 * Lead form submissions go to the contact endpoint on andresaviles.com, which
 * emails Andres's lead inbox. That route allows requests from this site's
 * origin only (see CORS in andresaviles-homes-loans/src/app/api/contact).
 */
export const CONTACT_ENDPOINT = "https://www.andresaviles.com/api/contact";

export const PHONE = { display: "214-908-5914", href: "tel:+12149085914" };

export const GUIDES = [
  { path: "/how-a-heloc-works", label: "How a HELOC Works" },
  { path: "/heloc-vs-cash-out-refinance", label: "HELOC vs. Cash-Out Refi" },
];

export const FAQS = [
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
