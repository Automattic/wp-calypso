/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'calypso/state/selectors/get-domain-from-home-upsell-in-query', () => jest.fn() );
jest.mock( 'calypso/components/external-link/with-tracking', () => jest.fn() );
jest.mock( 'classnames', () => jest.fn() );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	useDispatch: jest.fn(),
} ) );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useCallback: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	WpcomPlansUI: {
		store: null,
	},
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( selector ) => selector() ),
	useDispatch: jest.fn(),
} ) );
jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanBillPeriod: jest.fn(),
} ) );
jest.mock( '../../hooks/use-plan-prices-display', () => ( { usePlanPricesDisplay: jest.fn() } ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import { getPlanBillPeriod } from 'calypso/state/plans/selectors';
import { usePlanPricesDisplay } from '../../hooks/use-plan-prices-display';
import PlanFeatures2023GridActions from '../actions';

type PlanPricesDisplay = ReturnType< typeof usePlanPricesDisplay >;

describe( 'PlanFeatures2023GridActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useDispatch.mockImplementation( jest.fn( () => ( { setShowDomainUpsellDialog: jest.fn() } ) ) );
	} );

	describe( 'Upgrade button', () => {
		const upgrade = 'Upgrade';
		const upgradeToYearly = 'Upgrade to Yearly';
		const upgradeToBiennial = 'Upgrade to Biennial';
		const upgradeToTriennial = 'Upgrade to Triennial';
		const contactSupport = 'Contact support';
		const defaultProps = {
			availableForPurchase: true,
			canUserPurchasePlan: true,
			className: '',
			current: false,
			freePlan: false,
			manageHref: '',
			isInSignup: false,
			onUpgradeClick: jest.fn(),
			flowName: 'foo-flow',
			isWpcomEnterpriseGridPlan: false,
			selectedSiteSlug: 'foo.wordpress.com',
			isStuck: false,
			showMonthlyPrice: true,
			currencyCode: 'USD',
		};

		const planPrices: PlanPricesDisplay = {
			discountedPrice: 50,
			originalPrice: 100,
		};
		usePlanPricesDisplay.mockImplementation( () => planPrices );

		test( `should render ${ contactSupport } when current plan is on a lower tier but longer term than the grid plan`, () => {
			getPlanBillPeriod.mockImplementation( ( _state, planSlug ) =>
				planSlug === PLAN_PREMIUM_2_YEARS ? PLAN_BIENNIAL_PERIOD : PLAN_ANNUAL_PERIOD
			);

			render(
				<PlanFeatures2023GridActions
					{ ...defaultProps }
					currentSitePlanSlug={ PLAN_PREMIUM_2_YEARS }
					planName={ PLAN_BUSINESS }
					planSlug={ PLAN_BUSINESS }
				/>
			);

			const upgradeButton = screen.getByRole( 'button', { name: contactSupport } );

			expect( upgradeButton ).toBeDefined();
			expect( upgradeButton ).toBeDisabled();
		} );

		test( `should render ${ upgrade } when current plan and grid plan do not match`, () => {
			render(
				<PlanFeatures2023GridActions
					{ ...defaultProps }
					currentSitePlanSlug={ PLAN_PREMIUM }
					planName={ PLAN_BUSINESS }
					planSlug={ PLAN_BUSINESS }
				/>
			);

			const upgradeButton = screen.getByRole( 'button', { name: upgrade } );

			expect( upgradeButton ).toBeEnabled();
		} );

		describe( 'when current plan matches grid plan on lower term', () => {
			test( `should render ${ upgradeToYearly } when grid plan yearly`, () => {
				render(
					<PlanFeatures2023GridActions
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planName={ PLAN_BUSINESS }
						planSlug={ PLAN_BUSINESS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToYearly } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( `should render ${ upgradeToBiennial } when grid plan 2-yearly`, () => {
				render(
					<PlanFeatures2023GridActions
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planName={ PLAN_BUSINESS_2_YEARS }
						planSlug={ PLAN_BUSINESS_2_YEARS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToBiennial } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( `should render ${ upgradeToTriennial } when grid plan 3-yearly`, () => {
				render(
					<PlanFeatures2023GridActions
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planName={ PLAN_BUSINESS_3_YEARS }
						planSlug={ PLAN_BUSINESS_3_YEARS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToTriennial } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( 'should render the price when isStuck is true', () => {
				render(
					<PlanFeatures2023GridActions
						{ ...defaultProps }
						planName={ PLAN_BUSINESS_3_YEARS }
						planSlug={ PLAN_BUSINESS_3_YEARS }
						isStuck={ true }
					/>
				);
				const upgradeButton = screen.getByRole( 'button', { name: 'Upgrade – $50' } );

				expect( upgradeButton ).toHaveTextContent( 'Upgrade – $50' );
			} );
		} );
	} );
} );
