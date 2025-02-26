/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector() ),
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );
jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePricingMetaForGridPlans: jest.fn(),
	},
	AddOns: {
		useStorageAddOns: jest.fn(),
	},
} ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_FREE,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { render } from '@testing-library/react';
import { formatCurrency } from 'i18n-calypso';
import React from 'react';
import { usePlansGridContext } from '../../grid-context';
import BillingTimeframe from '../shared/billing-timeframe';

describe( 'BillingTimeframe', () => {
	const defaultProps = {
		billingTimeframe: 'per month, billed annually',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( `should show savings with yearly when plan is monthly`, () => {
		const planMonthlyPricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};
		const planYearlyPricing = {
			currencyCode: 'USD',
			originalPrice: { full: 60, monthly: 5 },
			discountedPrice: { full: 24, monthly: 2 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_BUSINESS ]: planYearlyPricing,
		} ) );

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_MONTHLY ]: {
					isMonthlyPlan: true,
					pricing: planMonthlyPricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_MONTHLY } />
		);
		const savings =
			( 100 *
				( planMonthlyPricing.originalPrice.monthly - planYearlyPricing.discountedPrice.monthly ) ) /
			planMonthlyPricing.originalPrice.monthly;

		expect( container ).toHaveTextContent( `Save ${ savings }%` );
	} );

	test( 'should show full-term discounted price when plan is yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS } />
		);

		const discountedPrice = formatCurrency( pricing.discountedPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent( `per month, ${ discountedPrice } for the first year` );
	} );

	test( 'should show full-term discounted price when plan is 2-yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_BIENNIAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_2_YEARS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_2_YEARS } />
		);
		const discountedPrice = formatCurrency( pricing.discountedPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ discountedPrice } for the first two years`
		);
	} );

	test( 'should show full-term discounted price when plan is 3-yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: 60, monthly: 5 },
			billingPeriod: PLAN_TRIENNIAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_3_YEARS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_3_YEARS } />
		);
		const discountedPrice = formatCurrency( pricing.discountedPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ discountedPrice } for the first three years`
		);
	} );

	test( 'should show full-term price when plan is yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS } />
		);

		const originalPrice = formatCurrency( pricing.originalPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ originalPrice } billed annually, excl. taxes`
		);
	} );

	test( 'should show full-term price when plan is 2-yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_BIENNIAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_2_YEARS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_2_YEARS } />
		);
		const originalPrice = formatCurrency( pricing.originalPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ originalPrice } billed every two years, excl. taxes`
		);
	} );

	test( 'should show full-term price when plan is 3-yearly', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_TRIENNIAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_3_YEARS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { container } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_3_YEARS } />
		);
		const originalPrice = formatCurrency( pricing.originalPrice.full, 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		expect( container ).toHaveTextContent(
			`per month, ${ originalPrice } billed every three years, excl. taxes`
		);
	} );

	test( 'show refund period period for annual plan', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_ANNUAL_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					isMonthlyPlan: false,
					pricing,
				},
			},
		} ) );

		const { getByText } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS } showRefundPeriod />
		);

		expect( getByText( /Refundable within 14 days. No questions asked./ ) ).toBeInTheDocument();
	} );

	test( 'show refund period period for monthly plan', () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 120, monthly: 10 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_MONTHLY_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_BUSINESS_MONTHLY ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { getByText } = render(
			<BillingTimeframe { ...defaultProps } planSlug={ PLAN_BUSINESS_MONTHLY } showRefundPeriod />
		);

		expect( getByText( /Refundable within 7 days. No questions asked./ ) ).toBeInTheDocument();
	} );

	test( `refund period can't be shown for free plan`, () => {
		const pricing = {
			currencyCode: 'USD',
			originalPrice: { full: 0, monthly: 0 },
			discountedPrice: { full: null, monthly: null },
			billingPeriod: PLAN_MONTHLY_PERIOD,
		};

		usePlansGridContext.mockImplementation( () => ( {
			gridPlansIndex: {
				[ PLAN_FREE ]: {
					isMonthlyPlan: true,
					pricing,
				},
			},
		} ) );

		const { queryByText } = render(
			<BillingTimeframe
				{ ...defaultProps }
				planSlug={ PLAN_FREE }
				showRefundPeriod // refund period won't be shown even though we set the prop to true
			/>
		);

		expect(
			queryByText( /Refundable within 7 days. No questions asked./ )
		).not.toBeInTheDocument();
	} );
} );
