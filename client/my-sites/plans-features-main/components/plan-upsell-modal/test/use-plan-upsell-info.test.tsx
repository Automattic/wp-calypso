/**
 * @jest-environment jsdom
 */
import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { renderHook } from '@testing-library/react';
import { usePlanUpsellInfo } from '../hooks/use-plan-upsell-info';

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( () => null ),
} ) );
jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => jest.fn()
);

const mockPricingMeta = ( pricing: Partial< Plans.PricingMetaForGridPlan > ) =>
	( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
		[ PLAN_PERSONAL ]: {
			currencyCode: 'USD',
			originalPrice: { monthly: 1000, full: 12000 },
			discountedPrice: { monthly: null, full: null },
			...pricing,
		},
	} );

const introOffer = {
	formattedPrice: '$48',
	rawPrice: { monthly: 400, full: 4800 },
	intervalUnit: 'year',
	intervalCount: 1,
	isOfferComplete: false,
};

describe( 'usePlanUpsellInfo', () => {
	test( 'uses the original price when there is no intro offer', () => {
		mockPricingMeta( {} );
		const { result } = renderHook( () => usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } ) );

		expect( result.current.formattedPriceMonthly ).toBe( '$10' );
		expect( result.current.formattedPriceFull ).toBe( '$120' );
	} );

	test( 'uses the first-year intro offer price when there is no discounted price', () => {
		mockPricingMeta( { introOffer } );
		const { result } = renderHook( () => usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } ) );

		expect( result.current.formattedPriceMonthly ).toBe( '$4' );
		expect( result.current.formattedPriceFull ).toBe( '$48' );
	} );

	test( 'ignores a completed intro offer', () => {
		mockPricingMeta( { introOffer: { ...introOffer, isOfferComplete: true } } );
		const { result } = renderHook( () => usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } ) );

		expect( result.current.formattedPriceMonthly ).toBe( '$10' );
	} );

	test( 'ignores an intro offer that does not cover exactly the first year', () => {
		mockPricingMeta( { introOffer: { ...introOffer, intervalUnit: 'month', intervalCount: 3 } } );
		const { result } = renderHook( () => usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } ) );

		expect( result.current.formattedPriceMonthly ).toBe( '$10' );
		expect( result.current.formattedPriceFull ).toBe( '$120' );
	} );

	test( 'prefers a discounted price over the intro offer', () => {
		mockPricingMeta( { introOffer, discountedPrice: { monthly: 300, full: 3600 } } );
		const { result } = renderHook( () => usePlanUpsellInfo( { planSlug: PLAN_PERSONAL } ) );

		expect( result.current.formattedPriceMonthly ).toBe( '$3' );
		expect( result.current.formattedPriceFull ).toBe( '$36' );
	} );
} );
