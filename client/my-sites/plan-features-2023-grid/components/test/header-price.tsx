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
jest.mock( 'calypso/my-sites/plans/hooks/use-plan-prices', () => jest.fn() );

import { render } from '@testing-library/react';
import React from 'react';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import type { PlanProperties } from '../../types';
import type { StorePlanSlug } from '@automattic/data-stores';
import type { PlanPrices } from 'calypso/state/plans/types';

describe( 'PlanFeatures2023GridHeaderPrice', () => {
	const planProperties = {
		planName: 'foo' as StorePlanSlug,
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
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 0,
			discountedRawPrice: 50,
			rawPrice: 100,
		};
		usePlanPrices.mockImplementation( () => planPrices );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toHaveTextContent( '50' );
	} );

	test( 'should render raw and plan-discounted prices when discount exists', () => {
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 50,
			discountedRawPrice: 10,
			rawPrice: 100,
		};
		usePlanPrices.mockImplementation( () => planPrices );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toHaveTextContent( '50' );
	} );

	test( 'should render just the raw price when no discount exists', () => {
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 0,
			discountedRawPrice: 0,
			rawPrice: 100,
		};
		usePlanPrices.mockImplementation( () => planPrices );

		const { container } = render( <PlanFeatures2023GridHeaderPrice { ...defaultProps } /> );
		const rawPrice = container.querySelector( '.plan-price' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toBeNull();
	} );
} );
