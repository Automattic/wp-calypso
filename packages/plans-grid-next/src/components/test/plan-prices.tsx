/**
 * @jest-environment jsdom
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: { usePricingMetaForGridPlans: jest.fn() },
} ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM,
	PLAN_TRIENNIAL_PERIOD,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { useMemo } from 'react';
import { usePlansGridContext } from '../../grid-context';
import PlanPrices from '../features-grid/plan-prices';
import type { GridPlan } from '../../types';

const makePlan = ( planSlug: PlanSlug, pricing: Partial< GridPlan[ 'pricing' ] > = {} ): GridPlan =>
	( {
		planSlug,
		pricing: {
			currencyCode: 'INR',
			originalPrice: { full: 12000, monthly: 1000 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
			...pricing,
		},
	} ) as GridPlan;

const introOffer = {
	formattedPrice: '₹500',
	rawPrice: { monthly: 500, full: 6000 },
	intervalUnit: 'year' as const,
	intervalCount: 1,
	isOfferComplete: false,
};

const prices = ( plans: GridPlan[] ) => {
	jest.mocked( usePlansGridContext ).mockReturnValue( {
		gridPlansIndex: Object.fromEntries( plans.map( ( plan ) => [ plan.planSlug, plan ] ) ),
	} as ReturnType< typeof usePlansGridContext > );
	return <PlanPrices renderedGridPlans={ plans } />;
};

const badgeSelector = '.plans-grid-next-header-price__badge';

describe( 'PlanPrices discount alignment', () => {
	beforeEach( () => {
		jest.mocked( Plans.usePricingMetaForGridPlans ).mockReturnValue( {} );
	} );

	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		const queryClient = useMemo( () => new QueryClient(), [] );
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

	test.each( [
		[ PLAN_PERSONAL_2_YEARS, PLAN_BIENNIAL_PERIOD ],
		[ PLAN_PERSONAL_3_YEARS, PLAN_TRIENNIAL_PERIOD ],
	] as const )(
		'clears offer spacing when switching to %s and restores the offer on return',
		( slug, term ) => {
			const annualPlans = [ makePlan( PLAN_PERSONAL, { introOffer } ) ];
			const { container, rerender } = render( prices( annualPlans ), { wrapper: Wrapper } );
			expect( container.querySelector( badgeSelector ) ).toHaveTextContent( 'Special Offer' );

			rerender( prices( [ makePlan( slug, { billingPeriod: term } ) ] ) );
			expect( container.querySelector( badgeSelector ) ).toBeNull();
			expect( container.querySelector( '.plan-price' ) ).toBeInTheDocument();

			rerender( prices( annualPlans ) );
			expect( container.querySelector( badgeSelector ) ).toHaveTextContent( 'Special Offer' );
		}
	);

	test( 'does not reserve offer space when initially showing a multi-year plan', () => {
		const { container } = render(
			prices( [ makePlan( PLAN_PERSONAL_2_YEARS, { billingPeriod: PLAN_BIENNIAL_PERIOD } ) ] ),
			{ wrapper: Wrapper }
		);
		expect( container.querySelector( badgeSelector ) ).toBeNull();
	} );

	test( 'clears spacing when an offer ends without changing the plan slug', () => {
		const { container, rerender } = render(
			prices( [ makePlan( PLAN_PERSONAL, { introOffer } ) ] ),
			{ wrapper: Wrapper }
		);

		rerender(
			prices( [
				makePlan( PLAN_PERSONAL, { introOffer: { ...introOffer, isOfferComplete: true } } ),
			] )
		);
		expect( container.querySelector( badgeSelector ) ).toBeNull();
	} );

	test( 'keeps alignment while another plan is discounted and clears it after the last discount', () => {
		const couponPlan = makePlan( PLAN_PREMIUM, {
			discountedPrice: { full: 6000, monthly: 500 },
		} );
		const regularPlan = makePlan( PLAN_BUSINESS );
		const { container, rerender } = render(
			prices( [ makePlan( PLAN_PERSONAL, { introOffer } ), couponPlan, regularPlan ] ),
			{ wrapper: Wrapper }
		);
		expect( container.querySelectorAll( badgeSelector ) ).toHaveLength( 3 );

		rerender( prices( [ makePlan( PLAN_PERSONAL ), couponPlan, regularPlan ] ) );
		expect( container.querySelectorAll( badgeSelector ) ).toHaveLength( 3 );
		expect( container.querySelectorAll( `${ badgeSelector }.is-hidden` ) ).toHaveLength( 2 );

		rerender( prices( [ makePlan( PLAN_PERSONAL ), makePlan( PLAN_PREMIUM ), regularPlan ] ) );
		expect( container.querySelectorAll( badgeSelector ) ).toHaveLength( 0 );
	} );

	test( 'clears spacing when the discounted plan is removed from the grid', () => {
		const regularPlan = makePlan( PLAN_PREMIUM );
		const { container, rerender } = render(
			prices( [ makePlan( PLAN_PERSONAL, { introOffer } ), regularPlan ] ),
			{ wrapper: Wrapper }
		);
		expect( container.querySelectorAll( badgeSelector ) ).toHaveLength( 2 );

		rerender( prices( [ regularPlan ] ) );
		expect( container.querySelector( badgeSelector ) ).toBeNull();
	} );
} );
