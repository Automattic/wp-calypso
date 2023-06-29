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
jest.mock( '../../hooks/use-plan-prices-display', () => ( { usePlanPricesDisplay: jest.fn() } ) );

import { render } from '@testing-library/react';
import React from 'react';
import { usePlanPricesDisplay } from '../../hooks/use-plan-prices-display';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import type { PlanProperties } from '../../types';

type PlanPricesDisplay = ReturnType< typeof usePlanPricesDisplay >;

describe( 'PlanFeatures2023GridHeaderPrice', () => {
	const planProperties = {
		planName: 'foo',
		showMonthlyPrice: false,
	} as PlanProperties;
	const defaultProps = {
		isLargeCurrency: false,
		planProperties,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render raw and discounted prices when discount exists', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 50,
			originalPrice: 100,
		};
		usePlanPricesDisplay.mockImplementation( () => planPrices );

		const { container } = render(
			<PlanFeatures2023GridHeaderPrice
				isPlanUpgradeCreditEligible={ false }
				currentSitePlanSlug=""
				{ ...defaultProps }
			/>
		);
		const rawPrice = container.querySelector( '.plan-price.is-original' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toHaveTextContent( '50' );
	} );

	test( 'should render just the raw price when no discount exists', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 0,
			originalPrice: 100,
		};
		usePlanPricesDisplay.mockImplementation( () => planPrices );

		const { container } = render(
			<PlanFeatures2023GridHeaderPrice
				isPlanUpgradeCreditEligible={ false }
				currentSitePlanSlug=""
				{ ...defaultProps }
			/>
		);
		const rawPrice = container.querySelector( '.plan-price' );
		const discountedPrice = container.querySelector( '.plan-price.is-discounted' );

		expect( rawPrice ).toHaveTextContent( '100' );
		expect( discountedPrice ).toBeNull();
	} );
} );
