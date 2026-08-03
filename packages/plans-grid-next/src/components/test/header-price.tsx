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
jest.mock( '../../lib/touch-detect', () => ( {
	hasTouch: () => false,
} ) );

jest.mock( '../shared/header-price/header-price-context', () => ( {
	useHeaderPriceContext: () => mockUseHeaderPriceContext(),
} ) );

import {
	type PlanSlug,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_MONTHLY_PERIOD,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useMemo } from 'react';
import { usePlansGridContext } from '../../grid-context';
import { GridPlan } from '../../types';
import HeaderPrice from '../shared/header-price';

const Wrapper = ( { children } ) => {
	const queryClient = useMemo( () => new QueryClient(), [] );

	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
};

const expectTooltipText = async ( text: string ) => {
	await waitFor( () => {
		expect(
			screen.getByText(
				( _content, element ) =>
					element?.classList.contains( 'popover__inner' ) &&
					element.textContent?.replace( /\s+/g, ' ' ) === text
			)
		).toBeInTheDocument();
	} );
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

	test.each( [
		[ '$120/year vs. $240 paying monthly', PLAN_PERSONAL, PLAN_ANNUAL_PERIOD ],
		[ '$240/2 years vs. $480 paying monthly', PLAN_PERSONAL_2_YEARS, PLAN_BIENNIAL_PERIOD ],
		[ '$360/3 years vs. $720 paying monthly', PLAN_PERSONAL_3_YEARS, PLAN_TRIENNIAL_PERIOD ],
	] )(
		'should show "%s" on pricing badge tooltips in the plans grid redesign experiment',
		async ( expectedTooltipText, planSlug, billingPeriod ) => {
			const pricing = {
				currencyCode: 'USD',
				originalPrice: { full: 12000, monthly: 1000 },
				discountedPrice: { full: null, monthly: null },
				billingPeriod,
			};

			mockUseHeaderPriceContext.mockReturnValue( {
				isAnyPlanPriceDiscounted: true,
				setIsAnyPlanPriceDiscounted: jest.fn(),
			} );
			( Plans.usePricingMetaForGridPlans as jest.Mock ).mockReturnValue( {
				[ PLAN_PERSONAL_MONTHLY ]: {
					originalPrice: { monthly: 2000, full: 24000 },
					discountedPrice: { monthly: null, full: null },
					billingPeriod: PLAN_MONTHLY_PERIOD,
				},
			} );

			usePlansGridContext.mockImplementation( () => ( {
				gridPlansIndex: {
					[ planSlug ]: {
						current: false,
						isMonthlyPlan: false,
						pricing,
					},
				},
				isExperimentVariant: true,
				showFeatureCheckmarks: true,
				enableTermSavingsPriceDisplay: true,
			} ) );

			const { container } = render(
				<HeaderPrice { ...defaultProps } planSlug={ planSlug as PlanSlug } />,
				{
					wrapper: Wrapper,
				}
			);
			const badge = container.querySelector(
				'.plans-grid-next-header-price__badge.is-plan-differentiators-experiment-badge:not(.is-hidden)'
			);
			const hoverArea = container.querySelector( '.plans-2023-tooltip__hover-area-container' );

			expect( badge ).toHaveTextContent( 'Save 50%' );
			expect( hoverArea ).toContainElement( badge );

			fireEvent.mouseEnter( hoverArea as Element );

			await expectTooltipText( expectedTooltipText );
		}
	);

	test( 'should show full-term renewal pricing on renewal pricing badge tooltips', async () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 21600, monthly: 1800 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
			introOffer: {
				formattedPrice: '$48.00',
				rawPrice: { monthly: 400, full: 4800 },
				intervalUnit: 'year',
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
				originalPrice: { monthly: 1800, full: 21600 },
				discountedPrice: { monthly: null, full: null },
				billingPeriod: PLAN_MONTHLY_PERIOD,
				introOffer: {
					formattedPrice: '$9.00',
					rawPrice: { monthly: 900, full: 900 },
					intervalUnit: 'month',
					intervalCount: 1,
					isOfferComplete: false,
				},
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
			isExperimentVariant: true,
			showFeatureCheckmarks: true,
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector(
			'.plans-grid-next-header-price__badge.is-plan-differentiators-experiment-badge:not(.is-hidden)'
		);
		const hoverArea = container.querySelector( '.plans-2023-tooltip__hover-area-container' );

		expect( badge ).toHaveTextContent( 'Save 76%' );
		expect( hoverArea ).toContainElement( badge );

		fireEvent.mouseEnter( hoverArea as Element );

		await expectTooltipText( '$48/year vs. $207 paying monthly' );
	} );

	test( 'should not show pricing badge tooltips for one-time discounts', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 12000, monthly: 1000 },
			discountedPrice: { full: 6000, monthly: 500 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_PERSONAL ]: {
					current: false,
					isMonthlyPlan: false,
					pricing,
				},
			},
			isExperimentVariant: true,
			showFeatureCheckmarks: true,
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector(
			'.plans-grid-next-header-price__badge.is-plan-differentiators-experiment-badge:not(.is-hidden)'
		);
		const hoverArea = container.querySelector( '.plans-2023-tooltip__hover-area-container' );

		expect( badge ).toHaveTextContent( 'One time discount' );
		expect( hoverArea ).toBeNull();
	} );

	test( 'should not show a pricing badge tooltip outside the plans grid redesign experiment', () => {
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
			isExperimentVariant: true,
			showFeatureCheckmarks: false,
			showBillingDescriptionForIncreasedRenewalPrice: 'crossed_price',
		} ) );

		const { container } = render( <HeaderPrice { ...defaultProps } />, { wrapper: Wrapper } );
		const badge = container.querySelector(
			'.plans-grid-next-header-price__badge.is-plan-differentiators-experiment-badge:not(.is-hidden)'
		);

		expect( badge ).toHaveTextContent( 'Save 50%' );
		expect( container.querySelector( '.plans-2023-tooltip__hover-area-container' ) ).toBeNull();
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
