/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StatsNotices from '../index';
import type { Notices } from '../../hooks/use-notice-visibility-query';

// The flag store is created inside the factory and parked on `globalThis`: `calypso-products`
// reads config while it is being imported, before any module-scope `const` here exists.
jest.mock( '@automattic/calypso-config', () => {
	const flags: Record< string, boolean > = {};
	( globalThis as Record< string, unknown > ).__statsNoticesTestFlags = flags;
	const isEnabled = ( flag: string ) => !! flags[ flag ];
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const mockFlags = () =>
	( globalThis as Record< string, unknown > ).__statsNoticesTestFlags as Record< string, boolean >;

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
	useDispatch: () => jest.fn(),
} ) );

// The registry is exercised by its own tests; here it stands in for "some notice wants to show",
// so the only thing under test is whether the host gets far enough to ask.
jest.mock( '../all-notice-definitions', () => ( {
	__esModule: true,
	default: [
		{
			component: () => <div>Notice under test</div>,
			noticeId: 'premium_analytics_preview',
			isVisibleFunc: () => true,
			disabled: false,
		},
	],
} ) );

jest.mock( 'calypso/components/data/query-site-stats', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../jitm-wrapper', () => ( { __esModule: true, default: () => null } ) );

const serverNoticesVisibility = {
	premium_analytics_preview: true,
} as unknown as Notices;
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-query', () => ( {
	...jest.requireActual( 'calypso/my-sites/stats/hooks/use-notice-visibility-query' ),
	useNoticesVisibilityQuery: () => ( {
		isLoading: false,
		isError: false,
		data: serverNoticesVisibility,
	} ),
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-plan-usage-query', () => ( {
	__esModule: true,
	default: () => ( { data: undefined } ),
	getUsageLimitStatus: () => ( { isNearLimit: false, isOverLimit: false } ),
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => ( {
	__esModule: true,
	default: () => ( { data: false, isLoading: false } ),
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-should-gate-stats', () => ( {
	shouldGateStats: () => false,
} ) );

jest.mock( '../../hooks/use-stats-purchases', () => ( {
	__esModule: true,
	default: () => ( { isRequestingSitePurchases: false, supportCommercialUse: true } ),
	shouldShowPaywallNotice: () => false,
} ) );

jest.mock( 'calypso/state/purchases/actions', () => ( {
	resetSiteState: () => ( { type: 'NOOP' } ),
} ) );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	hasLoadedSitePurchasesFromServer: () => true,
} ) );

let mockHasLoadedPlans = false;
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	hasLoadedSitePlansFromServer: () => mockHasLoadedPlans,
} ) );

jest.mock( 'calypso/state/sites/selectors/get-env-stats-feature-supports', () => ( {
	__esModule: true,
	default: () => ( { supportsNewStatsNotices: true } ),
} ) );

jest.mock( 'calypso/state/selectors/can-current-user', () => ( { canCurrentUser: () => true } ) );
jest.mock( 'calypso/state/selectors/get-site-features', () => ( {
	__esModule: true,
	default: () => ( { active: [] } ),
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpcom', () => ( {
	__esModule: true,
	default: () => true,
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpforteams', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/selectors/is-vip-site', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/selectors/site-has-feature', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors/get-site-option', () => ( {
	__esModule: true,
	default: () => undefined,
} ) );
jest.mock( 'calypso/state/sites/selectors/has-site-product-jetpack-stats-free', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors/has-site-product-jetpack-stats-pwyw-only', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors/is-jetpack-site', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/stats/lists/selectors', () => ( {
	getSiteStatsNormalizedData: () => ( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site', () => ( {
	__esModule: true,
	default: () => undefined,
} ) );

const renderNotices = () => render( <StatsNotices siteId={ 123 } isOdysseyStats={ false } /> );

/**
 * The wp-admin Stats app never puts site plans in the store, so the host cannot wait for them
 * there. `is_running_in_jetpack_site` used to stand in for "we are in wp-admin", which left every
 * notice permanently held back on a Simple site — where that flag is false.
 */
describe( 'StatsNotices loading gate', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasLoadedPlans = false;
		delete mockFlags().is_odyssey;
	} );

	it( 'waits for site plans in Calypso', () => {
		renderNotices();

		expect( screen.queryByText( 'Notice under test' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the notice in Calypso once site plans have loaded', () => {
		mockHasLoadedPlans = true;

		renderNotices();

		expect( screen.getByText( 'Notice under test' ) ).toBeVisible();
	} );

	it( 'does not wait for site plans in wp-admin, where they never load', () => {
		mockFlags().is_odyssey = true;

		renderNotices();

		expect( screen.getByText( 'Notice under test' ) ).toBeVisible();
	} );
} );
