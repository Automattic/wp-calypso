import {
	getPlanPriceForDuration,
	calculateDiscountPercentage,
	fromPricingMetaForGridPlan,
	fromVariantPriceData,
} from '../plan-pricing-utils';
import type { PlanPriceInfo, VariantPriceData } from '../plan-pricing-utils';
import type { Plans } from '@automattic/data-stores';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlanPriceInfo( overrides: Partial< PlanPriceInfo > = {} ): PlanPriceInfo {
	return {
		termMonths: 12,
		regularPricePerMonth: 2000,
		...overrides,
	};
}

function makePricingMeta(
	overrides: Partial< Plans.PricingMetaForGridPlan > = {}
): Plans.PricingMetaForGridPlan {
	return {
		originalPrice: { monthly: 2000, full: 24000 },
		discountedPrice: { monthly: null, full: null },
		...overrides,
	};
}

function makeVariant( overrides: Partial< VariantPriceData > = {} ): VariantPriceData {
	return {
		termIntervalInMonths: 12,
		priceInteger: 24000,
		priceBeforeDiscounts: 24000,
		introductoryInterval: 0,
		introductoryTerm: 'year',
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// getPlanPriceForDuration
// ---------------------------------------------------------------------------

describe( 'getPlanPriceForDuration', () => {
	describe( 'no intro offer', () => {
		it( 'returns regularPricePerMonth × durationMonths for a monthly plan', () => {
			const info = makePlanPriceInfo( { termMonths: 1, regularPricePerMonth: 2000 } );
			expect( getPlanPriceForDuration( info, 6 ) ).toBe( 12000 );
		} );

		it( 'returns pro-rated price for a yearly plan over 6 months', () => {
			const info = makePlanPriceInfo( { termMonths: 12, regularPricePerMonth: 1500 } );
			expect( getPlanPriceForDuration( info, 6 ) ).toBe( 9000 );
		} );

		it( 'uses discountedPricePerMonth instead of regularPricePerMonth when provided', () => {
			const info = makePlanPriceInfo( {
				termMonths: 12,
				regularPricePerMonth: 2000,
				discountedPricePerMonth: 1800,
			} );
			expect( getPlanPriceForDuration( info, 6 ) ).toBe( 10800 );
		} );

		it( 'uses discountedPricePerMonth for post-intro months when both are present', () => {
			const info = makePlanPriceInfo( {
				termMonths: 12,
				regularPricePerMonth: 2000,
				discountedPricePerMonth: 1800,
				introOffer: { pricePerMonth: 1000, durationMonths: 6, isActive: true },
			} );
			// 6 intro months × 1000 + 6 regular months × 1800
			expect( getPlanPriceForDuration( info, 12 ) ).toBe( 6000 + 10800 );
		} );
	} );

	describe( 'with active intro offer', () => {
		const monthlyWithIntro = makePlanPriceInfo( {
			termMonths: 1,
			regularPricePerMonth: 2000,
			introOffer: { pricePerMonth: 1000, durationMonths: 1, isActive: true },
		} );

		const yearlyWithIntro = makePlanPriceInfo( {
			termMonths: 12,
			regularPricePerMonth: 2000,
			introOffer: { pricePerMonth: 1000, durationMonths: 12, isActive: true },
		} );

		it( 'applies intro price for the first N months and regular price thereafter (monthly plan, 6 months)', () => {
			// 1 intro month × 1000 + 5 regular months × 2000
			expect( getPlanPriceForDuration( monthlyWithIntro, 6 ) ).toBe( 11000 );
		} );

		it( 'ignores intro price when useIntroOffer is false (monthly plan)', () => {
			expect( getPlanPriceForDuration( monthlyWithIntro, 6, { useIntroOffer: false } ) ).toBe(
				12000
			);
		} );

		it( 'applies intro price for a yearly plan over 6 months (duration shorter than intro)', () => {
			// intro covers 12 months; for 6 months only intro applies
			// 6 × 1000 = 6000
			expect( getPlanPriceForDuration( yearlyWithIntro, 6 ) ).toBe( 6000 );
		} );

		it( 'ignores intro price when useIntroOffer is false (yearly plan)', () => {
			expect( getPlanPriceForDuration( yearlyWithIntro, 6, { useIntroOffer: false } ) ).toBe(
				12000
			);
		} );

		it( 'handles duration longer than the intro period (3-month duration, 1-month intro)', () => {
			// 1 intro month × 1000 + 2 regular months × 2000
			expect( getPlanPriceForDuration( monthlyWithIntro, 3 ) ).toBe( 5000 );
		} );

		it( 'handles duration exactly equal to the intro period', () => {
			expect( getPlanPriceForDuration( monthlyWithIntro, 1 ) ).toBe( 1000 );
		} );
	} );

	describe( 'with inactive intro offer', () => {
		it( 'falls through to regular price when isActive is false, even if useIntroOffer is true', () => {
			const info = makePlanPriceInfo( {
				termMonths: 12,
				regularPricePerMonth: 2000,
				introOffer: { pricePerMonth: 1000, durationMonths: 12, isActive: false },
			} );
			expect( getPlanPriceForDuration( info, 6 ) ).toBe( 12000 );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'returns 0 for 0 duration months', () => {
			const info = makePlanPriceInfo( { termMonths: 12, regularPricePerMonth: 2000 } );
			expect( getPlanPriceForDuration( info, 0 ) ).toBe( 0 );
		} );
	} );
} );

// ---------------------------------------------------------------------------
// calculateDiscountPercentage
// ---------------------------------------------------------------------------

describe( 'calculateDiscountPercentage', () => {
	it( 'returns the floored percentage discount for a standard case', () => {
		// (2000 - 1400) / 2000 × 100 = 30
		expect( calculateDiscountPercentage( 2000, 1400 ) ).toBe( 30 );
	} );

	it( 'floors fractional percentages (does not round up)', () => {
		// (3000 - 2050) / 3000 × 100 = 31.666... → floor = 31
		expect( calculateDiscountPercentage( 3000, 2050 ) ).toBe( 31 );
	} );

	it( 'returns undefined when cheaperPrice equals referencePrice (no saving)', () => {
		expect( calculateDiscountPercentage( 2000, 2000 ) ).toBeUndefined();
	} );

	it( 'returns undefined when cheaperPrice is higher than referencePrice', () => {
		expect( calculateDiscountPercentage( 2000, 2500 ) ).toBeUndefined();
	} );

	it( 'returns undefined when referencePrice is zero', () => {
		expect( calculateDiscountPercentage( 0, 0 ) ).toBeUndefined();
	} );

	it( 'returns undefined when referencePrice is negative', () => {
		expect( calculateDiscountPercentage( -100, -200 ) ).toBeUndefined();
	} );

	it( 'returns 99 for a near-complete discount (not 100)', () => {
		// (1000 - 1) / 1000 × 100 = 99.9 → floor = 99
		expect( calculateDiscountPercentage( 1000, 1 ) ).toBe( 99 );
	} );
} );

// ---------------------------------------------------------------------------
// fromPricingMetaForGridPlan
// ---------------------------------------------------------------------------

describe( 'fromPricingMetaForGridPlan', () => {
	it( 'converts a monthly plan with no intro offer', () => {
		const meta = makePricingMeta( { billingPeriod: 31 } );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result ).toEqual( {
			termMonths: 1,
			regularPricePerMonth: 2000,
			discountedPricePerMonth: undefined,
			introOffer: undefined,
		} );
	} );

	it( 'converts a yearly plan with no intro offer', () => {
		const meta = makePricingMeta( { billingPeriod: 365 } );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result ).toEqual( {
			termMonths: 12,
			regularPricePerMonth: 2000,
			discountedPricePerMonth: undefined,
			introOffer: undefined,
		} );
	} );

	it( 'converts a biennial plan (730 days → 24 months)', () => {
		const meta = makePricingMeta( {
			billingPeriod: 730,
			originalPrice: { monthly: 1500, full: 36000 },
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.termMonths ).toBe( 24 );
		expect( result?.regularPricePerMonth ).toBe( 1500 );
	} );

	it( 'converts a triennial plan (1095 days → 36 months)', () => {
		const meta = makePricingMeta( {
			billingPeriod: 1095,
			originalPrice: { monthly: 1200, full: 43200 },
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.termMonths ).toBe( 36 );
	} );

	it( 'sets discountedPricePerMonth when discountedPrice.monthly is provided', () => {
		const meta = makePricingMeta( {
			billingPeriod: 365,
			discountedPrice: { monthly: 1800, full: 21600 },
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.discountedPricePerMonth ).toBe( 1800 );
	} );

	it( 'leaves discountedPricePerMonth undefined when discountedPrice.monthly is null', () => {
		const meta = makePricingMeta( { billingPeriod: 365 } );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.discountedPricePerMonth ).toBeUndefined();
	} );

	it( 'maps an active yearly intro offer (intervalUnit: year, intervalCount: 1)', () => {
		const meta = makePricingMeta( {
			billingPeriod: 365,
			introOffer: {
				rawPrice: { monthly: 1000, full: 12000 },
				intervalUnit: 'year',
				intervalCount: 1,
				isOfferComplete: false,
				formattedPrice: '$120',
			},
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.introOffer ).toEqual( {
			pricePerMonth: 1000,
			durationMonths: 12,
			isActive: true,
		} );
	} );

	it( 'maps a completed intro offer with isActive: false', () => {
		const meta = makePricingMeta( {
			billingPeriod: 365,
			introOffer: {
				rawPrice: { monthly: 1000, full: 12000 },
				intervalUnit: 'year',
				intervalCount: 1,
				isOfferComplete: true,
				formattedPrice: '$120',
			},
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.introOffer?.isActive ).toBe( false );
	} );

	it( 'maps an intro offer spanning 2 years (intervalUnit: year, intervalCount: 2 → 24 months)', () => {
		const meta = makePricingMeta( {
			billingPeriod: 730,
			originalPrice: { monthly: 1500, full: 36000 },
			introOffer: {
				rawPrice: { monthly: 900, full: 21600 },
				intervalUnit: 'year',
				intervalCount: 2,
				isOfferComplete: false,
				formattedPrice: '$216',
			},
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.introOffer?.durationMonths ).toBe( 24 );
	} );

	it( 'maps an intro offer in months (intervalUnit: month, intervalCount: 3 → 3 months)', () => {
		const meta = makePricingMeta( {
			billingPeriod: 365,
			introOffer: {
				rawPrice: { monthly: 500, full: 1500 },
				intervalUnit: 'month',
				intervalCount: 3,
				isOfferComplete: false,
				formattedPrice: '$15',
			},
		} );
		const result = fromPricingMetaForGridPlan( meta );
		expect( result?.introOffer?.durationMonths ).toBe( 3 );
	} );

	it( 'returns null when originalPrice.monthly is null', () => {
		const meta = makePricingMeta( {
			billingPeriod: 365,
			originalPrice: { monthly: null, full: null },
		} );
		expect( fromPricingMetaForGridPlan( meta ) ).toBeNull();
	} );

	it( 'returns null when billingPeriod is undefined', () => {
		const meta = makePricingMeta( { billingPeriod: undefined } );
		expect( fromPricingMetaForGridPlan( meta ) ).toBeNull();
	} );

	it( 'returns null for billingPeriod -1 (lifetime/unknown)', () => {
		const meta = makePricingMeta( { billingPeriod: -1 } );
		expect( fromPricingMetaForGridPlan( meta ) ).toBeNull();
	} );
} );

// ---------------------------------------------------------------------------
// fromVariantPriceData
// ---------------------------------------------------------------------------

describe( 'fromVariantPriceData', () => {
	it( 'converts a monthly plan with no intro offer', () => {
		const variant = makeVariant( {
			termIntervalInMonths: 1,
			priceInteger: 2000,
			priceBeforeDiscounts: 2000,
			introductoryInterval: 0,
		} );
		expect( fromVariantPriceData( variant ) ).toEqual( {
			termMonths: 1,
			regularPricePerMonth: 2000,
			introOffer: undefined,
		} );
	} );

	it( 'converts an annual plan with no intro offer', () => {
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceInteger: 24000,
			priceBeforeDiscounts: 24000,
			introductoryInterval: 0,
		} );
		const result = fromVariantPriceData( variant );
		expect( result.termMonths ).toBe( 12 );
		expect( result.regularPricePerMonth ).toBe( 2000 );
		expect( result.introOffer ).toBeUndefined();
	} );

	it( 'converts an annual plan where the entire term is the intro (1-year intro on annual plan)', () => {
		// priceInteger = 10000 (intro year), priceBeforeDiscounts = 24000 (regular year)
		// introDuration = 1 × 12 = 12 months = full term
		// nonIntroMonths = 12 - 12 = 0
		// introPriceTotal = 10000 - 0 × 2000 = 10000
		// introPricePerMonth = Math.round(10000 / 12) = Math.round(833.33) = 833
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceInteger: 10000,
			priceBeforeDiscounts: 24000,
			introductoryInterval: 1,
			introductoryTerm: 'year',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.termMonths ).toBe( 12 );
		expect( result.regularPricePerMonth ).toBe( 2000 );
		expect( result.introOffer ).toEqual( {
			pricePerMonth: 833,
			durationMonths: 12,
			isActive: true,
		} );
	} );

	it( 'derives intro price for a biennial plan with a 1-year intro', () => {
		// priceBeforeDiscounts = 48000 (2 × 24000 regular year)
		// priceInteger = 34000 (intro year 10000 + regular year 24000)
		// regularPricePerMonth = 48000 / 24 = 2000
		// introDuration = 1 × 12 = 12 months
		// nonIntroMonths = 24 - 12 = 12
		// introPriceTotal = 34000 - 12 × 2000 = 34000 - 24000 = 10000
		// introPricePerMonth = Math.round(10000 / 12) = Math.round(833.33) = 833
		const variant = makeVariant( {
			termIntervalInMonths: 24,
			priceInteger: 34000,
			priceBeforeDiscounts: 48000,
			introductoryInterval: 1,
			introductoryTerm: 'year',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.termMonths ).toBe( 24 );
		expect( result.regularPricePerMonth ).toBe( 2000 );
		expect( result.introOffer ).toEqual( {
			pricePerMonth: 833,
			durationMonths: 12,
			isActive: true,
		} );
	} );

	it( 'rounds regularPricePerMonth to the nearest integer for non-evenly-divisible prices', () => {
		// 10000 / 12 = 833.333... → rounds to 833 (not 834, and not a fraction)
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceBeforeDiscounts: 10000,
			priceInteger: 10000,
			introductoryInterval: 0,
		} );
		const result = fromVariantPriceData( variant );
		expect( result.regularPricePerMonth ).toBe( 833 );
		expect( Number.isInteger( result.regularPricePerMonth ) ).toBe( true );
	} );

	it( 'rounds introOffer.pricePerMonth to the nearest integer for non-evenly-divisible prices', () => {
		// Annual plan, full term is the intro period
		// priceBeforeDiscounts = 24000 → regularPricePerMonth = 2000 (exact)
		// priceInteger = 5000 → introPriceTotal = 5000 - 0*2000 = 5000
		// 5000 / 12 = 416.666... → rounds to 417
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceBeforeDiscounts: 24000,
			priceInteger: 5000,
			introductoryInterval: 1,
			introductoryTerm: 'year',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.introOffer?.pricePerMonth ).toBe( 417 );
		expect( Number.isInteger( result.introOffer?.pricePerMonth ) ).toBe( true );
	} );

	it( 'handles a monthly intro offer (introductoryTerm: month)', () => {
		// Monthly plan with a 1-month intro: the whole term is intro
		// termIntervalInMonths: 12, introDuration: 1 month
		// priceBeforeDiscounts: 24000, priceInteger: 22000
		// regularPricePerMonth = 24000 / 12 = 2000
		// nonIntroMonths = 12 - 1 = 11
		// introPriceTotal = 22000 - 11 × 2000 = 22000 - 22000 = 0 — not useful
		// Use a simpler case: termIntervalInMonths: 1, 1-month intro
		const variant = makeVariant( {
			termIntervalInMonths: 1,
			priceInteger: 1000,
			priceBeforeDiscounts: 2000,
			introductoryInterval: 1,
			introductoryTerm: 'month',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.introOffer?.durationMonths ).toBe( 1 );
		// nonIntroMonths = 1 - 1 = 0; introPriceTotal = 1000 - 0 = 1000
		expect( result.introOffer?.pricePerMonth ).toBe( 1000 );
	} );

	it( 'produces no introOffer when introductoryInterval is 0', () => {
		const variant = makeVariant( {
			priceInteger: 24000,
			priceBeforeDiscounts: 24000,
			introductoryInterval: 0,
		} );
		expect( fromVariantPriceData( variant ).introOffer ).toBeUndefined();
	} );

	it( 'produces no introOffer when priceInteger equals priceBeforeDiscounts (no actual discount)', () => {
		// introductoryInterval is set but prices are equal — indicates intro not applied
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceInteger: 24000,
			priceBeforeDiscounts: 24000,
			introductoryInterval: 1,
			introductoryTerm: 'year',
		} );
		expect( fromVariantPriceData( variant ).introOffer ).toBeUndefined();
	} );

	it( 'handles a multi-month intro on a monthly plan (introDurationMonths > termMonths)', () => {
		// Monthly plan ($20/month), 3-month intro at $5/month.
		// termMonths=1, introDurationMonths=3 → whole term is within the intro period.
		// nonIntroMonths = max(0, 1 - 3) = 0
		// introPriceTotal = 500 - 0 = 500
		// introPricePerMonth = round(500 / min(3, 1)) = round(500 / 1) = 500
		const variant = makeVariant( {
			termIntervalInMonths: 1,
			priceBeforeDiscounts: 2000,
			priceInteger: 500,
			introductoryInterval: 3,
			introductoryTerm: 'month',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.introOffer?.pricePerMonth ).toBe( 500 );
		expect( result.introOffer?.durationMonths ).toBe( 3 );
	} );

	it( 'handles a multi-year intro on an annual plan (introDurationMonths > termMonths)', () => {
		// Annual plan ($200/year), 3-year intro at $100/year.
		// termMonths=12, introDurationMonths=36 → whole term is within the intro period.
		// regularPricePerMonth = round(20000 / 12) = 1667
		// nonIntroMonths = max(0, 12 - 36) = 0
		// introPriceTotal = 10000 - 0 = 10000
		// introPricePerMonth = round(10000 / min(36, 12)) = round(10000 / 12) = 833
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceBeforeDiscounts: 20000,
			priceInteger: 10000,
			introductoryInterval: 3,
			introductoryTerm: 'year',
		} );
		const result = fromVariantPriceData( variant );
		expect( result.introOffer?.pricePerMonth ).toBe( 833 );
		expect( result.introOffer?.durationMonths ).toBe( 36 );
	} );

	it( 'produces no introOffer when introPriceTotal is non-positive (inconsistent data)', () => {
		// Annual plan with a 3-month intro, but priceInteger is too low to be consistent:
		// regularPricePerMonth = round(24000 / 12) = 2000
		// nonIntroMonths = 12 - 3 = 9
		// introPriceTotal = 1000 - 9 × 2000 = 1000 - 18000 = -17000 → bail out
		const variant = makeVariant( {
			termIntervalInMonths: 12,
			priceBeforeDiscounts: 24000,
			priceInteger: 1000,
			introductoryInterval: 3,
			introductoryTerm: 'month',
		} );
		expect( fromVariantPriceData( variant ).introOffer ).toBeUndefined();
	} );

	it( 'does not set discountedPricePerMonth', () => {
		const variant = makeVariant();
		const result = fromVariantPriceData( variant );
		expect( result.discountedPricePerMonth ).toBeUndefined();
	} );
} );

// ---------------------------------------------------------------------------
// Integration: adapters + getPlanPriceForDuration + calculateDiscountPercentage
// ---------------------------------------------------------------------------

describe( 'integration — fromPricingMetaForGridPlan → getPlanPriceForDuration → calculateDiscountPercentage', () => {
	it( 'calculates the annual vs monthly discount (no intro offers)', () => {
		const monthlyMeta = makePricingMeta( {
			billingPeriod: 31,
			originalPrice: { monthly: 2000, full: 2000 },
		} );
		const yearlyMeta = makePricingMeta( {
			billingPeriod: 365,
			originalPrice: { monthly: 1500, full: 18000 },
		} );

		const monthlyInfo = fromPricingMetaForGridPlan( monthlyMeta )!;
		const yearlyInfo = fromPricingMetaForGridPlan( yearlyMeta )!;

		// Compare monthly-equivalent prices for 12 months
		const monthlyEquivPerMonth =
			getPlanPriceForDuration( monthlyInfo, 12, { useIntroOffer: false } ) / 12;
		const yearlyEquivPerMonth =
			getPlanPriceForDuration( yearlyInfo, 12, { useIntroOffer: false } ) / 12;

		// (2000 - 1500) / 2000 × 100 = 25
		expect( calculateDiscountPercentage( monthlyEquivPerMonth, yearlyEquivPerMonth ) ).toBe( 25 );
	} );
} );

describe( 'integration — fromVariantPriceData → getPlanPriceForDuration → calculateDiscountPercentage', () => {
	it( 'calculates the upsell discount from annual to biennial (no intros)', () => {
		const annualVariant = makeVariant( {
			termIntervalInMonths: 12,
			priceInteger: 24000,
			priceBeforeDiscounts: 24000,
			introductoryInterval: 0,
		} );
		const biennialVariant = makeVariant( {
			termIntervalInMonths: 24,
			priceInteger: 40000,
			priceBeforeDiscounts: 40000,
			introductoryInterval: 0,
		} );

		const annualInfo = fromVariantPriceData( annualVariant );
		const biennialInfo = fromVariantPriceData( biennialVariant );

		// Normalise both to per-month cost over the biennial period (24 months)
		const refPerMonth = getPlanPriceForDuration( annualInfo, 24 ) / 24;
		const cheaperPerMonth = getPlanPriceForDuration( biennialInfo, 24 ) / 24;

		// annualInfo per month: 24000/12 = 2000; over 24 months: 48000 → 2000/mo
		// biennialInfo per month: 40000/24 ≈ 1666.67/mo
		// discount = floor((2000 - 1666.67) / 2000 × 100) = floor(16.67) = 16
		expect( calculateDiscountPercentage( refPerMonth, cheaperPerMonth ) ).toBe( 16 );
	} );
} );
