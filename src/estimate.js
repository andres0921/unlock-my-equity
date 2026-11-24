// Pure helpers behind the HELOC calculator. The math is intentionally simple:
// up to 80% combined loan-to-value for a primary residence, 75% for an
// investment property, minus what is still owed.
import { useMemo, useState } from "react";
import { INELIGIBLE_STATES, QUICK_TURN_STATES } from "./site";

export const CLTV = { owner: 0.8, investment: 0.75 };

export function formatNumberInput(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function parseCurrency(value) {
  return Number(String(value || "").replace(/,/g, ""));
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "$0";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function getCreditMessage(creditRange) {
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

export function getEligibilityMessage(stateName) {
  if (!stateName) return "";
  if (INELIGIBLE_STATES.includes(stateName)) {
    return `Properties located in ${stateName} do not qualify through this site.`;
  }
  return `Properties in ${stateName} may qualify, subject to product guidelines, underwriting, and state requirements.`;
}

export function getFastFundingMessage(stateName) {
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

/**
 * All calculator state, shared by the calculator panel and the lead form (so a
 * finished estimate is carried into the follow-up request).
 */
export function useEstimate() {
  const [homeValue, setHomeValue] = useState("");
  const [mortgageOwed, setMortgageOwed] = useState("");
  const [occupancyType, setOccupancyType] = useState("owner");
  const [creditRange, setCreditRange] = useState("");
  const [propertyState, setPropertyState] = useState("");

  const home = parseCurrency(homeValue);
  const owed = parseCurrency(mortgageOwed);
  const ltv = CLTV[occupancyType] ?? CLTV.owner;
  const maxLine = home * ltv;
  const estimatedLine = Math.max(maxLine - owed, 0);

  // A blank balance would silently count as $0, so we ask for an explicit 0.
  const owedEntered = mortgageOwed !== "";
  const complete = home > 0 && owedEntered && home > owed;

  const summary = useMemo(
    () => ({
      homeValue: formatCurrency(home),
      mortgageOwed: formatCurrency(owed),
      maxLine: formatCurrency(maxLine),
      estimatedLine: formatCurrency(estimatedLine),
      ltvLabel: `${Math.round(ltv * 100)}%`,
      propertyTypeLabel: occupancyType === "owner" ? "Primary Residence" : "Investment Property",
      creditMessage: getCreditMessage(creditRange),
      fastFundingMessage: getFastFundingMessage(propertyState),
      eligibilityMessage: getEligibilityMessage(propertyState),
    }),
    [home, owed, maxLine, estimatedLine, ltv, occupancyType, creditRange, propertyState]
  );

  return {
    values: { homeValue, mortgageOwed, occupancyType, creditRange, propertyState },
    set: { setHomeValue, setMortgageOwed, setOccupancyType, setCreditRange, setPropertyState },
    home,
    owed,
    owedEntered,
    complete,
    estimatedLine,
    summary,
    isIneligibleState: INELIGIBLE_STATES.includes(propertyState),
    // What the lead form sends along. Same fields and the same condition as
    // before the redesign: a home value and a credit range are both entered.
    leadEstimate: home > 0 && creditRange ? { ...summary, creditRange } : null,
  };
}
