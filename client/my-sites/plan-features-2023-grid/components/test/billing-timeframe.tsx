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
jest.mock( '../../hooks/use-plan-prices-display', () => ( { usePlanPricesDisplay: jest.fn() } ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import { render } from '@testing-library/react';
import React from 'react';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { usePlanPricesDisplay } from '../../hooks/use-plan-prices-display';
import PlanFeatures2023GridBillingTimeframe from '../billing-timeframe';

type PlanPricesDisplay = ReturnType< typeof usePlanPricesDisplay >;

describe( 'PlanFeatures2023GridBillingTimeframe', () => {
	const defaultProps = {
		billingTimeframe: 'per month, billed annually',
	};

	beforeEach( () => {
		jest.clearAllMocks();
		getCurrentUserCurrencyCode.mockImplementation( jest.fn( () => 'INR' ) );
	} );

	test( `should show savings with yearly when plan is monthly`, () => {
		const planMonthlyPrices: PlanPricesDisplay = {
			discountedPrice: 150,
			originalPrice: 200,
		};
		const planYearlyPrices: PlanPricesDisplay = {
			discountedPrice: 100,
			originalPrice: 150,
		};

		usePlanPricesDisplay.mockImplementation(
			jest.fn( ( { planSlug } ) => {
				if ( planSlug === PLAN_BUSINESS_MONTHLY ) {
					return planMonthlyPrices;
				}
				return planYearlyPrices;
			} )
		);

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				{ ...defaultProps }
				currentSitePlanSlug=""
				planName={ PLAN_BUSINESS_MONTHLY }
				isMonthlyPlan={ true }
				billingPeriod={ PLAN_MONTHLY_PERIOD }
			/>
		);
		const savings =
			( 100 * ( planMonthlyPrices.originalPrice - planYearlyPrices.discountedPrice ) ) /
			planMonthlyPrices.originalPrice;

		expect( container ).toHaveTextContent( `Save ${ savings }%` );
	} );

	test( 'should show full-term discounted price when plan is yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 150,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_ANNUAL_PERIOD }
			/>
		);

		const discountedPrice = formatCurrency( planPrices.discountedPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent( `per month, ${ discountedPrice } for the first year` );
	} );

	test( 'should show full-term discounted price when plan is 2-yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 150,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_2_YEARS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_BIENNIAL_PERIOD }
			/>
		);
		const discountedPrice = formatCurrency( planPrices.discountedPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ discountedPrice } for the first two years`
		);
	} );

	test( 'should show full-term discounted price when plan is 3-yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 150,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_3_YEARS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_TRIENNIAL_PERIOD }
			/>
		);
		const discountedPrice = formatCurrency( planPrices.discountedPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ discountedPrice } for the first three years`
		);
	} );

	test( 'should show full-term price when plan is yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 0,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_ANNUAL_PERIOD }
			/>
		);

		const originalPrice = formatCurrency( planPrices.originalPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent( `per month, ${ originalPrice } billed annually` );
	} );

	test( 'should show full-term price when plan is 2-yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 0,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_2_YEARS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_BIENNIAL_PERIOD }
			/>
		);
		const originalPrice = formatCurrency( planPrices.originalPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent( `per month, ${ originalPrice } billed every two years` );
	} );

	test( 'should show full-term price when plan is 3-yearly', () => {
		const planPrices: PlanPricesDisplay = {
			discountedPrice: 0,
			originalPrice: 200,
		};

		usePlanPricesDisplay.mockImplementation( jest.fn( () => planPrices ) );

		const { container } = render(
			<PlanFeatures2023GridBillingTimeframe
				currentSitePlanSlug=""
				{ ...defaultProps }
				planName={ PLAN_BUSINESS_3_YEARS }
				isMonthlyPlan={ false }
				billingPeriod={ PLAN_TRIENNIAL_PERIOD }
			/>
		);
		const originalPrice = formatCurrency( planPrices.originalPrice, 'INR', {
			stripZeros: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ originalPrice } billed every three years`
		);
	} );
} );
