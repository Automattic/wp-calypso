/**
 * @jest-environment jsdom
 */
import {
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PlanSlug,
} from '@automattic/calypso-products';
import { useCalculateMaxPlanUpgradeCredit } from 'calypso/my-sites/plans-grid/hooks/use-calculate-max-plan-upgrade-credit';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plans-grid/hooks/use-is-plan-upgrade-credit-visible';
import isAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isCurrentPlanPaid: jest.fn(),
	isJetpackSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getSitePlanSlug: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/plans-grid/hooks/use-calculate-max-plan-upgrade-credit', () => ( {
	useCalculateMaxPlanUpgradeCredit: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Mocked types
const mUsePlanUpgradeCredits = useCalculateMaxPlanUpgradeCredit as jest.MockedFunction<
	typeof useCalculateMaxPlanUpgradeCredit
>;
const mIsAutomatedTransfer = isAutomatedTransfer as jest.MockedFunction<
	typeof isAutomatedTransfer
>;
const mGetSitePlanSlug = getSitePlanSlug as jest.MockedFunction< typeof getSitePlanSlug >;
const mIsCurrentPlanPaid = isCurrentPlanPaid as jest.MockedFunction< typeof isCurrentPlanPaid >;
const mIsJetpackSite = isJetpackSite as jest.MockedFunction< typeof isJetpackSite >;

const siteId = 1;
const plansList: PlanSlug[] = [
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_ENTERPRISE_GRID_WPCOM,
];
describe( 'useIsPlanUpgradeCreditVisible hook', () => {
	beforeEach( () => {
		jest.resetAllMocks();

		mGetSitePlanSlug.mockImplementation( () => 'TYPE_BUSINESS' );
		mIsCurrentPlanPaid.mockImplementation( () => true );
		mUsePlanUpgradeCredits.mockImplementation( () => 100 );
		mIsJetpackSite.mockImplementation( () => true );
		mIsAutomatedTransfer.mockImplementation( () => true );
	} );

	test( 'Show a plans upgrade credit when the necessary conditions are met above', () => {
		const { result } = renderHookWithProvider( () =>
			useIsPlanUpgradeCreditVisible( siteId, plansList )
		);
		expect( result.current ).toEqual( true );
	} );

	test( 'Plan upgrade credits should not be shown when a site is on the highest purchasable plan', () => {
		mGetSitePlanSlug.mockImplementation( () => PLAN_ECOMMERCE );
		const { result } = renderHookWithProvider( () =>
			useIsPlanUpgradeCreditVisible( siteId, plansList )
		);
		expect( result.current ).toEqual( false );
	} );

	test( 'A non atomic jetpack site is not shown the plan upgrade credit', () => {
		mIsAutomatedTransfer.mockImplementation( () => false );
		mIsJetpackSite.mockImplementation( () => true );

		const { result } = renderHookWithProvider( () =>
			useIsPlanUpgradeCreditVisible( siteId, plansList )
		);
		expect( result.current ).toEqual( false );
	} );

	test( 'Plan upgrade credit should NOT be shown if there are no discounts provided by the pricing API', () => {
		mUsePlanUpgradeCredits.mockImplementation( () => 0 );

		const { result } = renderHookWithProvider( () =>
			useIsPlanUpgradeCreditVisible( siteId, plansList )
		);
		expect( result.current ).toEqual( false );
	} );

	test( 'Site on a free plan should not show the plan upgrade credit', () => {
		mIsCurrentPlanPaid.mockImplementation( () => false );

		const { result } = renderHookWithProvider( () =>
			useIsPlanUpgradeCreditVisible( siteId, plansList )
		);
		expect( result.current ).toEqual( false );
	} );
} );
