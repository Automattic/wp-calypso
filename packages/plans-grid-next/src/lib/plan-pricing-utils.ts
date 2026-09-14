import { Plans } from '@automattic/data-stores';

/**
 * Intermediate structure that normalizes plan pricing from different sources
 * (PricingMetaForGridPlan, WPCOMProductVariant) into a common shape suitable
 * for discount calculations.
 *
 * All prices are in the smallest currency unit (e.g. cents).
 */
export interface PlanPriceInfo {
	/** Billing period length in months (1, 12, 24, 36) */
	termMonths: number;
	/** Regular price per month — no intro offer, no site-level discount */
	regularPricePerMonth: number;
	/** Site-level discounted price per month (currency conversion / proration credit), if any */
	discountedPricePerMonth?: number;
	introOffer?: {
		/** Monthly-equivalent price during the intro period */
		pricePerMonth: number;
		/** How many months the intro offer lasts */
		durationMonths: number;
		/** False once the offer has already been used by this user */
		isActive: boolean;
	};
}

// billingPeriod values are in days (from PERIOD_LIST in calypso-products)
const BILLING_PERIOD_DAYS_TO_MONTHS: Record< number, number > = {
	31: 1,
	365: 12,
	730: 24,
	1095: 36,
};

function billingPeriodDaysToMonths( billingPeriod: number | undefined ): number | null {
	if ( billingPeriod === undefined || billingPeriod === null ) {
		return null;
	}
	return BILLING_PERIOD_DAYS_TO_MONTHS[ billingPeriod ] ?? null;
}

/**
 * Calculates the total cost of a plan over `durationMonths` months.
 *
 * Handles partial billing periods via pro-ration (e.g. a yearly plan priced at
 * $200/year costs $100 for 6 months).
 *
 * When `useIntroOffer` is true (default) and an active intro offer exists, the
 * intro price is applied for the first `introOffer.durationMonths` months, and
 * the regular (or discounted) price for the remainder.
 *
 * @example
 * // Monthly plan: $10 intro for 1 month, then $20/month; cost for 6 months:
 * // 1×$10 + 5×$20 = $110 (in cents: 1100 + 10000 = 11000)
 * getPlanPriceForDuration( info, 6, { useIntroOffer: true } ) // 11000
 *
 * @example
 * // Yearly plan: $100/yr intro, $200/yr regular; cost for 6 months:
 * // useIntroOffer=true  → 6×($100/12) = $50   (5000 cents)
 * // useIntroOffer=false → 6×($200/12) = $100  (10000 cents)
 */
export function getPlanPriceForDuration(
	info: PlanPriceInfo,
	durationMonths: number,
	{ useIntroOffer = true }: { useIntroOffer?: boolean } = {}
): number {
	const basePricePerMonth = info.discountedPricePerMonth ?? info.regularPricePerMonth;

	if ( useIntroOffer && info.introOffer?.isActive ) {
		const introMonths = Math.min( durationMonths, info.introOffer.durationMonths );
		const regularMonths = Math.max( 0, durationMonths - info.introOffer.durationMonths );
		return introMonths * info.introOffer.pricePerMonth + regularMonths * basePricePerMonth;
	}

	return durationMonths * basePricePerMonth;
}

/**
 * Calculates the percentage discount between a reference price and a cheaper price.
 *
 * Always uses Math.floor — conservative, never overstates savings.
 *
 * Returns `undefined` (not 0) when there is no saving, allowing callers to
 * distinguish "no discount" from a computed "0% discount".
 */
export function calculateDiscountPercentage(
	referencePrice: number,
	cheaperPrice: number
): number | undefined {
	if ( cheaperPrice >= referencePrice || referencePrice <= 0 ) {
		return undefined;
	}
	return Math.floor( ( 100 * ( referencePrice - cheaperPrice ) ) / referencePrice );
}

/**
 * Converts a `PricingMetaForGridPlan` (from @automattic/data-stores Plans hooks)
 * into a `PlanPriceInfo` suitable for use with `getPlanPriceForDuration` and
 * `calculateDiscountPercentage`.
 *
 * Returns null when required pricing data is absent (e.g. free/enterprise plans
 * that have no monthly price, or plans whose billing period is unknown).
 */
export function fromPricingMetaForGridPlan(
	meta: Plans.PricingMetaForGridPlan
): PlanPriceInfo | null {
	const termMonths = billingPeriodDaysToMonths( meta.billingPeriod );
	if ( termMonths === null || meta.originalPrice.monthly === null ) {
		return null;
	}

	const isIntroActive = !! meta.introOffer && ! meta.introOffer.isOfferComplete;

	return {
		termMonths,
		regularPricePerMonth: meta.originalPrice.monthly,
		// The API sometimes sets discountedPrice.monthly to the intro offer price rather than
		// a genuine site-level discount (e.g. currency conversion, proration credit). When an
		// intro offer is active the intro structure already captures the discounted period, so
		// using discountedPrice here would contaminate the post-intro "regular" rate used by
		// getPlanPriceForDuration — producing incorrect totals for the non-intro months.
		discountedPricePerMonth: isIntroActive ? undefined : meta.discountedPrice.monthly ?? undefined,
		introOffer: meta.introOffer
			? {
					pricePerMonth: meta.introOffer.rawPrice.monthly,
					durationMonths:
						meta.introOffer.intervalCount * ( meta.introOffer.intervalUnit === 'year' ? 12 : 1 ),
					isActive: isIntroActive,
			  }
			: undefined,
	};
}

/**
 * Minimal structural type describing the pricing fields needed from a product
 * variant. `WPCOMProductVariant` (defined in checkout) satisfies this interface
 * structurally, so it can be passed directly without importing the checkout type
 * into this package.
 *
 * Key invariants:
 *   - `priceBeforeDiscounts` is always the full-term cost at the regular rate.
 *   - `priceInteger` is the actual amount charged, which embeds both intro and
 *     non-intro portions when an intro offer spans only part of the term
 *     (e.g. a 1-year intro on a 2-year plan).
 *   - When `priceInteger < priceBeforeDiscounts`, the intro price portion is
 *     derived by subtracting the non-intro months at the regular rate.
 */
export interface VariantPriceData {
	introductoryInterval: number;
	/** 'month' | 'year' */
	introductoryTerm: string;
	/** Full-term price at the regular (non-intro) rate */
	priceBeforeDiscounts: number;
	/** Actual price charged for the full term (may embed an intro offer) */
	priceInteger: number;
	termIntervalInMonths: number;
}

/**
 * Converts a variant price data object (structurally compatible with
 * `WPCOMProductVariant`) into a `PlanPriceInfo`.
 *
 * `discountedPricePerMonth` is intentionally not set: `WPCOMProductVariant`
 * does not separate site-level discounts from the intro price. Coupon discounts
 * in checkout are tracked separately via `product.coupon_savings_integer`.
 *
 * Per-month values are derived by dividing full-term prices (integers in the
 * smallest currency unit) by the number of months. The result is rounded to the
 * nearest integer (Math.round) so that all fields in the returned `PlanPriceInfo`
 * remain whole-cent values safe for use with currency formatters. The rounding
 * error is at most 0.5¢ per month and is negligible for percentage comparisons.
 */
export function fromVariantPriceData( variant: VariantPriceData ): PlanPriceInfo {
	const {
		termIntervalInMonths: termMonths,
		priceBeforeDiscounts,
		priceInteger,
		introductoryInterval,
		introductoryTerm,
	} = variant;

	const regularPricePerMonth = Math.round( priceBeforeDiscounts / termMonths );

	const introDurationMonths =
		introductoryInterval > 0 ? introductoryInterval * ( introductoryTerm === 'year' ? 12 : 1 ) : 0;

	let introOffer: PlanPriceInfo[ 'introOffer' ] | undefined;

	if ( introDurationMonths > 0 && priceInteger < priceBeforeDiscounts ) {
		// When the intro spans the full term (introDurationMonths >= termMonths), all of
		// priceInteger is at the intro rate and there are zero non-intro months.
		// When the intro is shorter than the term (introDurationMonths < termMonths), we
		// subtract the non-intro portion (billed at the regular rate) to isolate the intro cost.
		const nonIntroMonths = Math.max( 0, termMonths - introDurationMonths );
		const introPriceTotal = priceInteger - nonIntroMonths * regularPricePerMonth;

		// A non-positive introPriceTotal means inconsistent data (e.g. a sub-term intro
		// with a priceInteger that is less than the non-intro months at the regular rate).
		if ( introPriceTotal > 0 ) {
			// When introDurationMonths > termMonths the whole billing term is within the
			// intro period, so we spread introPriceTotal over termMonths (not introDurationMonths).
			introOffer = {
				pricePerMonth: Math.round( introPriceTotal / Math.min( introDurationMonths, termMonths ) ),
				durationMonths: introDurationMonths,
				isActive: true,
			};
		}
	}

	return { termMonths, regularPricePerMonth, introOffer };
}
