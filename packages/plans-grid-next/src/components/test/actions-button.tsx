/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	createSelector: jest.fn(),
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
	AddOns: {
		useStorageAddOns: jest.fn(),
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
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );

import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import React from 'react';
import { usePlansGridContext } from '../../grid-context';
import ActionButton from '../shared/action-button';

describe( 'ActionButton', () => {
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
			className: '',
			current: false,
			freePlan: false,
			isInSignup: false,
			onUpgradeClick: jest.fn(),
			isStuck: false,
			showMonthlyPrice: true,
			visibleGridPlans: [],
		};

		const pricing = {
			discountedPrice: { monthly: null, full: null },
			originalPrice: { monthly: 2000, full: 24000 },
			currencyCode: 'USD',
		};

		test( `should render ${ contactSupport } when current plan is on a lower tier but longer term than the grid plan`, () => {
			usePlansGridContext.mockImplementation( () => ( {
				gridPlansIndex: {
					[ PLAN_BUSINESS ]: {
						isMonthlyPlan: false,
						pricing: {
							...pricing,
							billingPeriod: PLAN_ANNUAL_PERIOD,
						},
						features: {},
					},
					[ PLAN_PREMIUM_2_YEARS ]: {
						isMonthlyPlan: false,
						pricing: {
							...pricing,
							billingPeriod: PLAN_BIENNIAL_PERIOD,
						},
						features: {},
					},
				},
				helpers: {
					useAction: () => ( {
						primary: {
							callback: () => {},
							text: contactSupport,
							status: 'disabled',
						},
						postButtonText: '',
					} ),
				},
			} ) );

			render(
				<ActionButton
					{ ...defaultProps }
					currentSitePlanSlug={ PLAN_PREMIUM_2_YEARS }
					planSlug={ PLAN_BUSINESS }
				/>
			);

			const upgradeButton = screen.getByRole( 'button', { name: contactSupport } );

			expect( upgradeButton ).toBeDefined();
			expect( upgradeButton ).toBeDisabled();
		} );

		test( `should render ${ upgrade } when current plan and grid plan do not match`, () => {
			usePlansGridContext.mockImplementation( () => ( {
				gridPlansIndex: {
					[ PLAN_BUSINESS ]: {
						isMonthlyPlan: false,
						pricing: {
							...pricing,
							billingPeriod: PLAN_ANNUAL_PERIOD,
						},
						features: {},
					},
					[ PLAN_PREMIUM ]: {
						isMonthlyPlan: false,
						pricing: {
							...pricing,
							billingPeriod: PLAN_ANNUAL_PERIOD,
						},
						features: {},
					},
				},
				helpers: {
					useAction: () => ( {
						primary: {
							callback: () => {},
							text: upgrade,
							status: '',
						},
						postButtonText: '',
					} ),
				},
			} ) );

			render(
				<ActionButton
					{ ...defaultProps }
					currentSitePlanSlug={ PLAN_PREMIUM }
					planSlug={ PLAN_BUSINESS }
				/>
			);

			const upgradeButton = screen.getByRole( 'button', { name: upgrade } );

			expect( upgradeButton ).toBeEnabled();
		} );

		describe( 'when current plan matches grid plan on lower term', () => {
			test( `should render ${ upgradeToYearly } when grid plan yearly`, () => {
				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS ]: {
							isMonthlyPlan: false,
							pricing: {
								...pricing,
								billingPeriod: PLAN_ANNUAL_PERIOD,
							},
							features: {},
						},
						[ PLAN_BUSINESS_MONTHLY ]: {
							isMonthlyPlan: true,
							pricing: {
								...pricing,
								billingPeriod: PLAN_MONTHLY_PERIOD,
							},
							features: {},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: upgradeToYearly,
								status: '',
							},
							postButtonText: '',
						} ),
					},
				} ) );
				render(
					<ActionButton
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planSlug={ PLAN_BUSINESS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToYearly } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( `should render ${ upgradeToBiennial } when grid plan 2-yearly`, () => {
				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS ]: {
							isMonthlyPlan: false,
							pricing: {
								...pricing,
								billingPeriod: PLAN_ANNUAL_PERIOD,
							},
							features: {},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: '',
								status: '',
							},
							postButtonText: '',
						} ),
					},
				} ) );
				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS_2_YEARS ]: {
							isMonthlyPlan: false,
							pricing: {
								...pricing,
								billingPeriod: PLAN_BIENNIAL_PERIOD,
							},
							features: {},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: upgradeToBiennial,
								status: '',
							},
							postButtonText: '',
						} ),
					},
				} ) );

				render(
					<ActionButton
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planSlug={ PLAN_BUSINESS_2_YEARS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToBiennial } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( `should render ${ upgradeToTriennial } when grid plan 3-yearly`, () => {
				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS_3_YEARS ]: {
							isMonthlyPlan: false,
							pricing: {
								...pricing,
								billingPeriod: PLAN_TRIENNIAL_PERIOD,
							},
							features: {},
						},
						[ PLAN_BUSINESS_MONTHLY ]: {
							isMonthlyPlan: true,
							pricing: {
								...pricing,
								billingPeriod: PLAN_MONTHLY_PERIOD,
							},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: upgradeToTriennial,
								status: '',
							},
							postButtonText: '',
						} ),
					},
				} ) );
				render(
					<ActionButton
						{ ...defaultProps }
						currentSitePlanSlug={ PLAN_BUSINESS_MONTHLY }
						planSlug={ PLAN_BUSINESS_3_YEARS }
					/>
				);

				const upgradeButton = screen.getByRole( 'button', { name: upgradeToTriennial } );

				expect( upgradeButton ).toBeEnabled();
			} );

			test( 'should render the price when isStuck is true', () => {
				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS_3_YEARS ]: {
							isMonthlyPlan: false,
							pricing: {
								...pricing,
								billingPeriod: PLAN_TRIENNIAL_PERIOD,
							},
							features: {},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: 'Upgrade – $20',
								status: '',
							},
							postButtonText: '',
						} ),
					},
				} ) );
				render( <ActionButton { ...defaultProps } planSlug={ PLAN_BUSINESS_3_YEARS } isStuck /> );
				const upgradeButton = screen.getByRole( 'button', { name: 'Upgrade – $20' } );

				expect( upgradeButton ).toHaveTextContent( 'Upgrade – $20' );
			} );

			test( 'should render the post button text', () => {
				const planActionOverrides = {
					trialAlreadyUsed: {
						postButtonText: "You've already used your free trial! Thanks!",
					},
				};

				usePlansGridContext.mockImplementation( () => ( {
					gridPlansIndex: {
						[ PLAN_BUSINESS ]: {
							pricing: {
								...pricing,
							},
							features: {},
						},
					},
					helpers: {
						useAction: () => ( {
							primary: {
								callback: () => {},
								text: '',
								status: '',
							},
							postButtonText: "You've already used your free trial! Thanks!",
						} ),
					},
				} ) );
				render(
					<ActionButton
						{ ...defaultProps }
						isInSignup
						planSlug={ PLAN_BUSINESS }
						isStuck={ false }
					/>
				);

				expect(
					screen.getByText( planActionOverrides.trialAlreadyUsed.postButtonText )
				).toBeInTheDocument();
			} );
		} );
	} );
} );
