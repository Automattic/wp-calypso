import {
	getSitePlanRenewalPriceWithTerm,
	getSitePlanTermMonths,
	isScheduledOnlyPlanChange,
	isShorterTermPlanChange,
} from '../scheduled-term-change';
import type { SitePlanData } from 'calypso/state/sites/plans/types';

const sitePlan = ( overrides: Partial< SitePlanData > = {} ) =>
	( {
		productSlug: 'value_bundle',
		productName: 'WordPress.com Premium',
		interval: 365,
		currencyCode: 'USD',
		rawPriceInteger: 9600,
		rawDiscountInteger: 0,
		...overrides,
	} ) as SitePlanData;

const translate = ( ( text: string, options?: { args?: Record< string, string > } ) =>
	Object.entries( options?.args ?? {} ).reduce(
		( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
		text
	) ) as never;

describe( 'getSitePlanTermMonths', () => {
	test.each( [
		[ 31, 1 ],
		[ 365, 12 ],
		[ 730, 24 ],
		[ 1095, 36 ],
	] )( 'reads an interval of %d days as %d months', ( interval, months ) => {
		expect( getSitePlanTermMonths( sitePlan( { interval } ) ) ).toBe( months );
	} );

	test( 'returns null when the plans endpoint reports no interval', () => {
		expect( getSitePlanTermMonths( sitePlan( { interval: NaN } ) ) ).toBeNull();
		expect( getSitePlanTermMonths( undefined ) ).toBeNull();
	} );
} );

describe( 'isShorterTermPlanChange', () => {
	test( 'is true for a shorter term, whatever the tier', () => {
		expect(
			isShorterTermPlanChange( sitePlan( { interval: 730 } ), sitePlan( { interval: 365 } ) )
		).toBe( true );
		expect(
			isShorterTermPlanChange(
				sitePlan( { interval: 365 } ),
				sitePlan( { productSlug: 'business-bundle-monthly', interval: 31 } )
			)
		).toBe( true );
	} );

	test( 'is false for the same or a longer term, or when a term is unknown', () => {
		expect( isShorterTermPlanChange( sitePlan(), sitePlan() ) ).toBe( false );
		expect(
			isShorterTermPlanChange( sitePlan( { interval: 31 } ), sitePlan( { interval: 365 } ) )
		).toBe( false );
		expect( isShorterTermPlanChange( undefined, sitePlan( { interval: 31 } ) ) ).toBe( false );
	} );
} );

describe( 'isScheduledOnlyPlanChange', () => {
	test( 'is true only when the server allows the change at renewal but not now', () => {
		const flags = { availableForDowngrade: true, isDelayedDowngradeAvailable: true };
		expect(
			isScheduledOnlyPlanChange( sitePlan( { ...flags, isInstantDowngradeAvailable: false } ) )
		).toBe( true );
		expect(
			isScheduledOnlyPlanChange( sitePlan( { ...flags, isInstantDowngradeAvailable: true } ) )
		).toBe( false );
		expect( isScheduledOnlyPlanChange( sitePlan( { availableForDowngrade: true } ) ) ).toBe(
			false
		);
	} );
} );

describe( 'getSitePlanRenewalPriceWithTerm', () => {
	const formatPrice = ( amount: number ) => `$${ amount / 100 }`;

	test( 'prices the renewal at the original cost, ignoring any discount', () => {
		expect(
			getSitePlanRenewalPriceWithTerm(
				sitePlan( { interval: 31, rawPriceInteger: 600, rawDiscountInteger: 200 } ),
				formatPrice,
				translate
			)
		).toBe( '$8/month' );
	} );

	test( 'returns null for a term without a label', () => {
		expect(
			getSitePlanRenewalPriceWithTerm( sitePlan( { interval: 1460 } ), formatPrice, translate )
		).toBeNull();
	} );
} );
