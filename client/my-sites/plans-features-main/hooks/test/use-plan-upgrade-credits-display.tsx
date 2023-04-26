import {
	PLAN_ENTERPRISE_GRID_WPCOM,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_PERSONAL,
	TYPE_FREE,
} from '@automattic/calypso-products';
import { usePlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits';
import isAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { usePlanUpgradeCreditsDisplay } from '../use-plan-upgrade-credits-display';
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
	isJetpackSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getSitePlanSlug: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits', () => ( {
	usePlanUpgradeCredits: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Mocked types
const mUsePlanUpgradeCredits = usePlanUpgradeCredits as jest.MockedFunction<
	typeof usePlanUpgradeCredits
>;
const mIsAutomatedTransfer = isAutomatedTransfer as jest.MockedFunction<
	typeof isAutomatedTransfer
>;
const mGetSitePlanSlug = getSitePlanSlug as jest.MockedFunction< typeof getSitePlanSlug >;
const mIsCurrentPlanPaid = isCurrentPlanPaid as jest.MockedFunction< typeof isCurrentPlanPaid >;
const mIsJetpackSite = isJetpackSite as jest.MockedFunction< typeof isJetpackSite >;

const siteId = 1;
const plansList = [
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	PLAN_ENTERPRISE_GRID_WPCOM,
];
describe( 'usePlanUpgradeCreditsDisplay hook', () => {
	beforeEach( () => {
		mGetSitePlanSlug.mockImplementation( () => 'TYPE_BUSINESS' );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mUsePlanUpgradeCredits.mockImplementation( () => 100 );
		mIsJetpackSite.mockImplementation( () => true );
		mIsAutomatedTransfer.mockImplementation( () => true );
	} );

	test( 'Show a plans upgrade credit when the necessary conditions are met above', () => {
		const mocks = [];

		const { result } = renderHookWithProvider( () =>
			usePlanUpgradeCreditsDisplay( siteId, plansList )
		);
		expect( result.current ).toEqual( { creditsValue: 100, isPlanUpgradeCreditEligible: true } );
		mocks.forEach( ( m ) => m.mockRestore() );
	} );

	test( 'Plan upgrade credits should not be shown when a site is on the highest purchasable plan', () => {
		mGetSitePlanSlug.mockImplementation( () => TYPE_ECOMMERCE );
		const { result } = renderHookWithProvider( () =>
			usePlanUpgradeCreditsDisplay( siteId, plansList )
		);
		expect( result.current ).toEqual( { creditsValue: 100, isPlanUpgradeCreditEligible: false } );
	} );

	test( 'A non atomic jetpack site is not shown the plan upgrade credit', () => {
		mIsAutomatedTransfer.mockImplementation( () => false );
		mIsJetpackSite.mockImplementation( () => true );

		const { result } = renderHookWithProvider( () =>
			usePlanUpgradeCreditsDisplay( siteId, plansList )
		);
		expect( result.current ).toEqual( { creditsValue: 100, isPlanUpgradeCreditEligible: false } );
	} );

	test( 'Plan upgrade credit should NOT be shown if there are no discounts provided by the pricing API', () => {
		mUsePlanUpgradeCredits.mockImplementation( () => 0 );

		const { result } = renderHookWithProvider( () =>
			usePlanUpgradeCreditsDisplay( siteId, plansList )
		);
		expect( result.current ).toEqual( { creditsValue: 0, isPlanUpgradeCreditEligible: false } );
	} );

	test( 'Site on a free plan should not show the plan upgrade credit', () => {
		mIsCurrentPlanPaid.mockImplementation( () => false );

		const { result } = renderHookWithProvider( () =>
			usePlanUpgradeCreditsDisplay( siteId, plansList )
		);
		expect( result.current ).toEqual( { creditsValue: 100, isPlanUpgradeCreditEligible: false } );
	} );
} );
