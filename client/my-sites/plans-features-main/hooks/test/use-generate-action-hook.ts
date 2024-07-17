/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		useCurrentPlan: jest.fn(),
		useCurrentPlanExpiryDate: jest.fn(),
	},
} ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => jest.fn( ( text ) => text ),
	localize: jest.fn(),
	translate: jest.fn(),
} ) );

jest.mock( '../use-generate-action-callback', () => jest.fn( () => jest.fn() ) );

import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_FREE,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_SMALL,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import useGenerateActionHook from '../use-generate-action-hook';

describe( 'useGenerateActionHook', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useSelector as jest.Mock ).mockReturnValue( 'mock-site-slug' );
		( Plans.useCurrentPlan as jest.Mock ).mockImplementation( () => ( { [ PLAN_FREE ]: {} } ) );
		( Plans.useCurrentPlan as jest.Mock ).mockImplementation( () => null );
	} );

	it( 'should handle enterprise plans', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_ENTERPRISE_GRID_WPCOM } );

		expect( action.primary.text ).toBe( 'Learn more' );
		expect( action.primary.status ).toBe( 'enabled' );
	} );

	it( 'should handle launch page actions for free plan', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: true } );

		const action = result( { planSlug: PLAN_FREE } );

		expect( action.primary.text ).toBe( 'Keep this plan' );
	} );

	it( 'should handle launch page actions for paid plans with sticky buttons', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: true } );

		const action = result( {
			planSlug: PLAN_BUSINESS,
			isStuck: true,
			isLargeCurrency: false,
			planTitle: 'Business',
			priceString: '$300',
		} );

		// The assertion is okay since we don't actually run the translate function
		expect( action.primary.text ).toBe( 'Select %(plan)s – %(priceString)s' );
	} );

	it( 'should handle signup actions for free trial', () => {
		const result = useGenerateActionHook( { isInSignup: true, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS, isFreeTrialAction: true } );

		expect( action.primary.text ).toBe( 'Try for free' );
	} );

	it( 'should handle signup actions for free plan', () => {
		const result = useGenerateActionHook( { isInSignup: true, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_FREE } );

		expect( action.primary.text ).toBe( 'Start with Free' );
	} );

	it( 'should handle signup actions for business plan with ineligible free hosting trial', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				current_user: {
					had_hosting_trial: true,
				},
				sites: {
					items: [],
				},
			} )
		);
		const result = useGenerateActionHook( {
			isInSignup: true,
			isLaunchPage: false,
			plansIntent: 'plans-new-hosted-site',
		} );
		const action = result( { planSlug: PLAN_BUSINESS } );

		expect( action.postButtonText ).toBe( "You've already used your free trial! Thanks!" );
	} );

	it( 'should handle signup actions for plans with sticky buttons and isLargeCurrency as false', () => {
		const result = useGenerateActionHook( { isInSignup: true, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS, isStuck: true, isLargeCurrency: false } );

		// The assertion is okay since we don't actually run the translate function
		expect( action.primary.text ).toBe( 'Get %(plan)s – %(priceString)s' );
	} );

	it( 'should handle signup actions for plans with sticky buttons and isLargeCurrency as true', () => {
		const result = useGenerateActionHook( { isInSignup: true, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS, isStuck: true, isLargeCurrency: true } );

		expect( action.primary.text ).toBe( 'Get %(plan)s {{span}}%(priceString)s{{/span}}' );
	} );

	it( 'should handle current free plan', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( { planSlug: PLAN_FREE } );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_FREE } );

		expect( action.primary.text ).toBe( 'Manage add-ons' );
		expect( action.primary.status ).toBe( 'enabled' );
	} );

	it( 'should handle upgrade with sticky buttons', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_PERSONAL,
		} );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( {
			planSlug: PLAN_BUSINESS,
			availableForPurchase: true,
			isStuck: true,
			priceString: '$300',
		} );

		expect( action.primary.text ).toBe( 'Upgrade – %(priceString)s' );
	} );

	it( 'should handle upgrade to longer billing period - annual', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS_MONTHLY,
		} );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( {
			planSlug: PLAN_BUSINESS,
			availableForPurchase: true,
		} );

		expect( action.primary.text ).toBe( 'Upgrade to Yearly' );
	} );

	it( 'should handle upgrade to longer billing period - Biennial', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS_MONTHLY,
		} );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( {
			planSlug: PLAN_BUSINESS_2_YEARS,
			availableForPurchase: true,
		} );

		expect( action.primary.text ).toBe( 'Upgrade to Biennial' );
	} );

	it( 'should handle upgrade to longer billing period - Triennial', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS_MONTHLY,
		} );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( {
			planSlug: PLAN_BUSINESS_3_YEARS,
			availableForPurchase: true,
		} );

		expect( action.primary.text ).toBe( 'Upgrade to Triennial' );
	} );

	it( 'should handle current plan for plan owner', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS,
		} );
		( useSelector as jest.Mock ).mockReturnValue( true ); // mocking isCurrentUserCurrentPlanOwner

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS } );

		expect( action.primary.text ).toBe( 'Manage plan' );
	} );

	it( 'should handle expired current plan for plan owner', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS,
		} );
		( Plans.useCurrentPlanExpiryDate as jest.Mock ).mockReturnValue(
			new Date( Date.now() - 86400000 )
		); // yesterday
		( useSelector as jest.Mock ).mockReturnValue( true ); // mocking isCurrentUserCurrentPlanOwner

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS } );

		expect( action.primary.text ).toBe( 'Renew plan' );
	} );

	it( 'should handle current plan for domainFromHomeUpsellFlow', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_BUSINESS,
		} );
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				sites: {
					items: [],
				},
				route: {
					query: {
						current: {
							get_domain: 'mockdomain',
						},
					},
				},
			} )
		);

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS } );

		expect( action.primary.text ).toBe( 'Keep my plan' );
	} );

	it( 'should handle WooExpress Medium plan upgrade', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_WOOEXPRESS_MEDIUM } );

		expect( action.primary.text ).toBe( 'Get Performance' );
	} );

	it( 'should handle WooExpress Small plan upgrade', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_WOOEXPRESS_SMALL } );

		expect( action.primary.text ).toBe( 'Get Essential' );
	} );

	it( 'should handle business trial upgrade', () => {
		( Plans.useCurrentPlan as jest.Mock ).mockReturnValue( {
			planSlug: PLAN_HOSTING_TRIAL_MONTHLY,
		} );

		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_BUSINESS } );

		expect( action.primary.text ).toBe( 'Get %(plan)s' );
	} );

	it( 'should handle downgrade actions', () => {
		const result = useGenerateActionHook( { isInSignup: false, isLaunchPage: false } );

		const action = result( { planSlug: PLAN_PERSONAL, availableForPurchase: false } );

		expect( action.primary.text ).toBe( 'Downgrade' );
		expect( action.primary.variant ).toBe( 'secondary' );
	} );
} );
