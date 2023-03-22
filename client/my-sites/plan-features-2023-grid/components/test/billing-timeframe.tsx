/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'calypso/state/currency-code/selectors', () => ( {
	getCurrentUserCurrencyCode: jest.fn(),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector() ),
} ) );
jest.mock( 'calypso/my-sites/plans/hooks/use-plan-prices', () => jest.fn() );
jest.mock( '@wordpress/data', () => ( {
	createRegistrySelector: jest.fn(),
	registerStore: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	useSelect: jest.fn(),
} ) );

import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { render } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import React from 'react';
import usePlanPrices from 'calypso/my-sites/plans/hooks/use-plan-prices';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { PlanPrices } from 'calypso/state/plans/types';
import PlanFeatures2023GridBillingTimeframe from '../billing-timeframe';

describe( 'PlanFeatures2023GridBillingTimeframe', () => {
	const defaultProps = {
		billingTimeframe: 'per month, billed annually',
	} as const;

	beforeEach( () => {
		jest.clearAllMocks();
		getCurrentUserCurrencyCode.mockImplementation( jest.fn( () => 'INR' ) );
	} );

	test( `should show savings with yearly when plan is monthly`, () => {
		const planMonthlyPrices: PlanPrices = {
			planDiscountedRawPrice: 100,
			discountedRawPrice: 150,
			rawPrice: 200,
		};
		const planYearlyPrices: PlanPrices = {
			planDiscountedRawPrice: 50,
			discountedRawPrice: 100,
			rawPrice: 150,
		};

		usePlanPrices.mockImplementation(
			jest.fn( ( { planSlug } ) => {
				if ( planSlug === PLAN_BUSINESS_MONTHLY ) {
					return planMonthlyPrices;
				}
				return planYearlyPrices;
			} )
		);

		useSelect.mockImplementation(
			jest.fn( () => {
				return {
					term: TERM_MONTHLY,
				};
			} )
		);

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_MONTHLY }
				isMonthlyPlan={ true }
			/>
		);
		const savings =
			( 100 * ( planMonthlyPrices.rawPrice - planYearlyPrices.discountedRawPrice ) ) /
			planMonthlyPrices.rawPrice;

		expect( container ).toHaveTextContent( `Save ${ savings }%` );
	} );

	test( 'should show full-term discounted price when plan is yearly', () => {
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 100,
			discountedRawPrice: 150,
			rawPrice: 200,
		};

		usePlanPrices.mockImplementation( jest.fn( () => planPrices ) );

		useSelect.mockImplementation(
			jest.fn( () => {
				return {
					term: TERM_ANNUALLY,
				};
			} )
		);

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				{ ...defaultProps }
				planName={ PLAN_BUSINESS }
				isMonthlyPlan={ false }
			/>
		);

		expect( container ).toHaveTextContent(
			`per month, ${ formatCurrency(
				planPrices.planDiscountedRawPrice,
				getCurrentUserCurrencyCode(),
				{ stripZeros: true }
			) } billed annually`
		);
	} );

	test( 'should show full-term discounted price when plan is 2-yearly', () => {
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 100,
			discountedRawPrice: 150,
			rawPrice: 200,
		};

		usePlanPrices.mockImplementation( jest.fn( () => planPrices ) );

		useSelect.mockImplementation(
			jest.fn( () => {
				return {
					term: TERM_BIENNIALLY,
				};
			} )
		);

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_2_YEARS }
				isMonthlyPlan={ false }
			/>
		);

		expect( container ).toHaveTextContent(
			`per month, ${ formatCurrency(
				planPrices.planDiscountedRawPrice,
				getCurrentUserCurrencyCode(),
				{ stripZeros: true }
			) } billed every two years`
		);
	} );

	test( 'should show full-term discounted price when plan is 3-yearly', () => {
		const planPrices: PlanPrices = {
			planDiscountedRawPrice: 100,
			discountedRawPrice: 150,
			rawPrice: 200,
		};

		usePlanPrices.mockImplementation( jest.fn( () => planPrices ) );

		useSelect.mockImplementation(
			jest.fn( () => {
				return {
					term: TERM_TRIENNIALLY,
				};
			} )
		);

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_3_YEARS }
				isMonthlyPlan={ false }
			/>
		);

		expect( container ).toHaveTextContent(
			`per month, ${ formatCurrency(
				planPrices.planDiscountedRawPrice,
				getCurrentUserCurrencyCode(),
				{ stripZeros: true }
			) } billed every three years`
		);
	} );
} );
