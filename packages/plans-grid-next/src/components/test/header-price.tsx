/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useCallback: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );

import {
	type PlanSlug,
	PLAN_ANNUAL_PERIOD,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { render } from '@testing-library/react';
import React from 'react';
import { usePlansGridContext } from '../../grid-context';
import HeaderPrice from '../shared/header-price';

describe( 'HeaderPrice', () => {
	const defaultProps = {
		isLargeCurrency: false,
		planSlug: PLAN_PERSONAL as PlanSlug,
		visibleGridPlans: [],
	};

	beforeEach( () => {
		jest.clearAllMocks();
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

		const { container } = render( <HeaderPrice { ...defaultProps } /> );
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

		const { container } = render( <HeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '10' );
		expect( discountedPrice ).toBeNull();
	} );

	test( 'should render empty for the enterprise plan', () => {
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
			<HeaderPrice { ...defaultProps } planSlug={ PLAN_ENTERPRISE_GRID_WPCOM } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should display "Limited Time Offer" badge when intro offer exists and offer is not complete', () => {
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

		const { container } = render( <HeaderPrice { ...defaultProps } /> );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toHaveTextContent( 'Limited Time Offer' );
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

		const { container } = render( <HeaderPrice { ...defaultProps } /> );
		const badge = container.querySelector( '.plans-grid-next-header-price__badge' );

		expect( badge ).toHaveTextContent( 'One time discount' );
	} );
} );
