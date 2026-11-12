/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
vi.mock( '@wordpress/data', () => ( {
	useSelect: vi.fn(),
	combineReducers: vi.fn(),
	createReduxStore: vi.fn(),
	createSelector: vi.fn(),
	register: vi.fn(),
	registerStore: vi.fn(),
	useDispatch: vi.fn(),
} ) );
vi.mock( '@wordpress/element', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/element' ) >( '@wordpress/element' ) ),
	useCallback: vi.fn(),
} ) );
vi.mock( '@automattic/data-stores', async () => ( {
	WpcomPlansUI: {
		store: null,
	},
	AddOns: {
		useStorageAddOns: vi.fn(),
	},
	Purchases: {
		useSitePurchasesByProductSlug: vi.fn(),
	},
	Plans: {
		...(
			await vi.importActual< typeof import( '@automattic/data-stores' ) >(
				'@automattic/data-stores'
			)
		).Plans,
		usePricingMetaForGridPlans: vi.fn(),
	},
} ) );
vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual< typeof import( 'i18n-calypso' ) >( 'i18n-calypso' ) ),
} ) );
vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual< typeof import( 'react-redux' ) >( 'react-redux' ) ),
	useSelector: vi.fn( ( selector ) => selector() ),
	useDispatch: vi.fn(),
} ) );
vi.mock( '../../grid-context', () => ( { usePlansGridContext: vi.fn() } ) );

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
import { vi } from 'vitest';
import { usePlansGridContext } from '../../grid-context';
import ActionButton from '../shared/action-button';

describe( 'ActionButton', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		useDispatch.mockImplementation( vi.fn( () => ( { setShowDomainUpsellDialog: vi.fn() } ) ) );
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
			onUpgradeClick: vi.fn(),
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
