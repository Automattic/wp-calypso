// This copy is the only place the grid states what a shopper will actually be
// charged. It shipped without an "excl. taxes" note in #107817 (MARTECH-3020),
// so pin the suffix on both strings.

// Only the billing-period constants are needed here; mocking them keeps
// calypso-config (and its browser-context requirement) out of the test.
jest.mock( '@automattic/calypso-products', () => ( {
	PLAN_MONTHLY_PERIOD: 31,
	PLAN_ANNUAL_PERIOD: 365,
	PLAN_BIENNIAL_PERIOD: 730,
	PLAN_TRIENNIAL_PERIOD: 1095,
} ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { getRenewalPricingText } from '../get-renewal-pricing-text';
import type { Plans as PlansType } from '@automattic/data-stores';

// Mirror i18n-calypso's interpolation closely enough to assert on the final copy.
const translate = ( text: string, options?: { args?: Record< string, unknown > } ) =>
	Object.entries( options?.args ?? {} ).reduce(
		( result, [ key, value ] ) => result.replace( `%(${ key })s`, String( value ) ),
		text
	);

const pricingFor = ( billingPeriod: number ) =>
	( {
		currencyCode: 'USD',
		originalPrice: { full: 12000, monthly: 1000 },
		discountedPrice: { full: null, monthly: null },
		billingPeriod,
	} ) as unknown as PlansType.PricingMetaForGridPlan;

const render = ( billingPeriod: number ) =>
	getRenewalPricingText( {
		pricing: pricingFor( billingPeriod ),
		showBillingDescriptionForIncreasedRenewalPrice: 'large_increase',
		translate,
	} );

describe( 'getRenewalPricingText', () => {
	test( 'notes excluded taxes on a monthly plan', () => {
		expect( render( PLAN_MONTHLY_PERIOD ) ).toBe(
			'Auto-renews at $10 per month. Billed every month, excl. taxes.'
		);
	} );

	test.each( [
		[ PLAN_ANNUAL_PERIOD, 12 ],
		[ PLAN_BIENNIAL_PERIOD, 24 ],
		[ PLAN_TRIENNIAL_PERIOD, 36 ],
	] )( 'notes excluded taxes on a %s-day billing period', ( billingPeriod, months ) => {
		expect( render( billingPeriod ) ).toBe(
			`Auto-renews at $10 per month. Billed every ${ months } months, excl. taxes.`
		);
	} );

	test( 'returns null when the renewal pricing variation is not set', () => {
		expect(
			getRenewalPricingText( {
				pricing: pricingFor( PLAN_ANNUAL_PERIOD ),
				showBillingDescriptionForIncreasedRenewalPrice: null,
				translate,
			} )
		).toBeNull();
	} );
} );
