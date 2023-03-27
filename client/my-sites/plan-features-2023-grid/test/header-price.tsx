/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'calypso/state/currency-code/selectors', () => ( {
	getCurrentUserCurrencyCode: jest.fn(),
} ) );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useCallback: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( '../../plans/hooks/use-plan-prices', () => jest.fn() );

import { render } from '@testing-library/react';
import React from 'react';
import usePlanPrices from '../../plans/hooks/use-plan-prices';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import { PlanProperties } from '../types';

describe( 'PlanFeatures2023GridHeaderPrice', () => {
	const planProperties = {
		planName: 'foo',
		showMonthlyPrice: false,
	} as PlanProperties;
	const defaultProps = {
		is2023OnboardingPricingGrid: true,
		isLargeCurrency: false,
		planProperties,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render raw and discounted prices when discount exists', () => {
		usePlanPrices.mockImplementation( () => ( {
			planDiscountedRawPrice: 0,
			discountedRawPrice: 50,
			rawPrice: 100,
		} ) );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toHaveTextContent( '50' );
	} );

	test( 'should render raw and plan-discounted prices when discount exists', () => {
		usePlanPrices.mockImplementation( () => ( {
			planDiscountedRawPrice: 50,
			discountedRawPrice: 0,
			rawPrice: 100,
		} ) );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toHaveTextContent( '50' );
	} );

	test( 'should render just the raw price when no discount exists', () => {
		usePlanPrices.mockImplementation( () => ( {
			planDiscountedRawPrice: 0,
			discountedRawPrice: 0,
			rawPrice: 100,
		} ) );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toBeNull();
	} );
} );
