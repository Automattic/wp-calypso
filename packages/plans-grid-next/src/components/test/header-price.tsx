/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
const mockUseHeaderPriceContext = jest.fn();

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useCallback: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	AddOns: {
		useStorageAddOns: jest.fn(),
	},
	Plans: {
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

jest.mock( '../shared/header-price/header-price-context', () => ( {
	useHeaderPriceContext: () => mockUseHeaderPriceContext(),
} ) );

import {
	type PlanSlug,
	PLAN_ANNUAL_PERIOD,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React, { useMemo } from 'react';
import { usePlansGridContext } from '../../grid-context';
import { GridPlan } from '../../types';
import HeaderPrice from '../shared/header-price';

const Wrapper = ( { children } ) => {
	const queryClient = useMemo( () => new QueryClient(), [] );

	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
};

describe( 'HeaderPrice', () => {
	const defaultProps = {
		isLargeCurrency: false,
		planSlug: PLAN_PERSONAL as PlanSlug,
		visibleGridPlans: [],
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: false,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {} );
	} );

	test( 'should render raw and discounted prices when discount exists', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '10' );
		expect( discountedPrice ).toHaveTextContent( '5' );
	} );

	test( 'should render just the raw price when no discount exists', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const rawPrice = container.querySelector( '.plan-price' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '10' );
		expect( discountedPrice ).toBeNull();
	} );

	test( 'should render client logos but no price for the enterprise plan', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_ENTERPRISE_GRID_WPCOM ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<HeaderPrice { ...defaultProps } planSlug={ PLAN_ENTERPRISE_GRID_WPCOM } />,
			{ wrapper: Wrapper }
		);

		expect( container.querySelector( '.plan-price' ) ).toBeNull();
		expect(
			container.querySelector( '.plans-grid-next-header-price__enterprise-logos' )
		).toBeInTheDocument();
	} );

	test( 'should display "Special Offer" badge when intro offer exists and offer is not complete', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
			introOffer: {
				formattedPrice: '$5.00',
				rawPrice: 5,
				intervalUnit: 'month',
				intervalCount: 1,
				isOfferComplete: false,
			},
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toHaveTextContent( 'Special Offer' );
	} );

	test( 'should display "One time discount" badge when there is a monthly discounted price', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toHaveTextContent( 'One time discount' );
	} );

	test( 'should display "Save x%" badge in renewal experiment for downgraded-site style pricing', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 20, full: 240 },
				discountedPrice: { monthly: null, full: null },
				billingPeriod: 31,
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: true,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toHaveTextContent( 'Save 50%' );
	} );

	test( 'should show the monthly plan price crossed out and the annual monthly-equivalent as the current price', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 20, full: 240 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: false,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const originalPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( originalPrice ).toHaveTextContent( '20' );
		expect( discountedPrice ).toHaveTextContent( '10' );
	} );

	test( 'should not show a badge when the plan is the current plan', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 20, full: 240 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: true,
					isMonthlyPlan: false,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toBeNull();
	} );

	test( 'should not show the crossed-out price when monthly plan price does not exceed the annual price', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 10, full: 120 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: false,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const originalPrice = container.querySelector( '.plan-price.is-original' );

		expect( originalPrice ).toBeNull();
	} );

	test( 'should use the monthly plan price as the crossed-out price when intro offer and experiment are both active', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
			introOffer: {
				formattedPrice: '$5.00',
				rawPrice: { monthly: 5, full: 60 },
				intervalUnit: 'month',
				intervalCount: 1,
				isOfferComplete: false,
			},
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 20, full: 240 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: false,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const originalPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		// Crossed-out price should be the monthly plan price (20), not the plan's own original price (10)
		expect( originalPrice ).toHaveTextContent( '20' );
		// Current price should be the intro offer price (5)
		expect( discountedPrice ).toHaveTextContent( '5' );
	} );

	test( 'should show a hidden badge placeholder for current plan in crossed_price when multiple plans are visible', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 20, full: 240 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: true,
					isMonthlyPlan: false,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const stubPlan = {
			pricing: {
				originalPrice: { full: 0, monthly: 0 },
				discountedPrice: { full: null, monthly: null },
				currencyCode: 'USD',
			},
		} as GridPlan;

		const { container } = render(
			<HeaderPrice { ...defaultProps } visibleGridPlans={ [ stubPlan, stubPlan ] } />,
			{ wrapper: Wrapper }
		);
		const visibleBadge = container.querySelector(
			'.plans-grid-next-header-price__badge:not(.is-hidden)'
		);
		const hiddenBadge = container.querySelector( '.plans-grid-next-header-price__badge.is-hidden' );

		expect( visibleBadge ).toBeNull();
		expect( hiddenBadge ).toBeInTheDocument();
	} );

	test( 'should show a hidden badge placeholder for current plan with intro offer when multiple plans are visible', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
			introOffer: {
				formattedPrice: '$5.00',
				rawPrice: { monthly: 5, full: 60 },
				intervalUnit: 'month',
				intervalCount: 1,
				isOfferComplete: false,
			},
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: true,
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const stubPlan = {
			pricing: {
				originalPrice: { full: 0, monthly: 0 },
				discountedPrice: { full: null, monthly: null },
				currencyCode: 'USD',
			},
		} as GridPlan;

		const { container } = render(
			<HeaderPrice { ...defaultProps } visibleGridPlans={ [ stubPlan, stubPlan ] } />,
			{ wrapper: Wrapper }
		);
		const visibleBadge = container.querySelector(
			'.plans-grid-next-header-price__badge:not(.is-hidden)'
		);
		const hiddenBadge = container.querySelector( '.plans-grid-next-header-price__badge.is-hidden' );

		expect( visibleBadge ).toBeNull();
		expect( hiddenBadge ).toBeInTheDocument();
	} );

	test( 'should keep the fallback badge hidden in crossed_price when savings is zero', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		mockUseHeaderPriceContext.mockReturnValue( {
			isAnyPlanPriceDiscounted: true,
			setIsAnyPlanPriceDiscounted: jest.fn(),
		} );
		( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
			[ PLAN_PERSONAL_MONTHLY ]: {
				originalPrice: { monthly: 10, full: 120 },
				discountedPrice: { monthly: null, full: null },
			},
		} );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: true,
					pricing,
				},
			},
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const visibleBadge = container.querySelector(
			'.plans-grid-next-header-price__badge:not(.is-hidden)'
		);
		const hiddenBadge = container.querySelector( '.plans-grid-next-header-price__badge.is-hidden' );

		expect( visibleBadge ).toBeNull();
		expect( hiddenBadge ).toBeInTheDocument();
	} );
} );
