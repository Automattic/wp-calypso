/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import StatsNotices from '../index';
import type { Notices } from '../../hooks/use-notice-visibility-query';

// The flag store is created inside the factory and parked on `globalThis`: `calypso-products`
// reads config while it is being imported, before any module-scope `const` here exists.
jest.mock( '@automattic/calypso-config', () => {
	const flags: Record< string, boolean > = {};
	( globalThis as Record< string, unknown > ).__notShownEventTestFlags = flags;
	const isEnabled = ( flag: string ) => !! flags[ flag ];
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const mockFlags = () =>
	( globalThis as Record< string, unknown > ).__notShownEventTestFlags as Record< string, boolean >;

const mockRecordTracksEvent = jest.fn();
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( '../all-notice-definitions', () => ( { __esModule: true, default: [] } ) );

jest.mock( 'calypso/components/data/query-site-stats', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../jitm-wrapper', () => ( { __esModule: true, default: () => null } ) );

let mockNoticesVisibility = {
	isLoading: false,
	isError: false,
	data: { premium_analytics_preview: true } as unknown as Notices,
};
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-query', () => ( {
	...jest.requireActual( 'calypso/my-sites/stats/hooks/use-notice-visibility-query' ),
	useNoticesVisibilityQuery: () => mockNoticesVisibility,
} ) );

let mockPremiumAnalyticsStatus: {
	data: boolean | undefined;
	isLoading: boolean;
	isError: boolean;
} = { data: false, isLoading: false, isError: false };
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => ( {
	__esModule: true,
	default: () => mockPremiumAnalyticsStatus,
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-plan-usage-query', () => ( {
	__esModule: true,
	default: () => ( { data: undefined } ),
	getUsageLimitStatus: () => ( { isNearLimit: false, isOverLimit: false } ),
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
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	hasLoadedSitePlansFromServer: () => true,
} ) );

jest.mock( 'calypso/state/sites/selectors/get-env-stats-feature-supports', () => ( {
	__esModule: true,
	default: () => ( { supportsNewStatsNotices: true } ),
} ) );

let mockCanManageOptions = true;
jest.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: () => mockCanManageOptions,
} ) );

let mockSiteFeatures: unknown = { active: [] };
jest.mock( 'calypso/state/selectors/get-site-features', () => ( {
	__esModule: true,
	default: () => mockSiteFeatures,
} ) );

let mockIsWpcom = true;
jest.mock( 'calypso/state/selectors/is-site-wpcom', () => ( {
	__esModule: true,
	default: () => mockIsWpcom,
} ) );

let mockIsP2 = false;
jest.mock( 'calypso/state/selectors/is-site-wpforteams', () => ( {
	__esModule: true,
	default: () => mockIsP2,
} ) );

let mockIsVip = false;
jest.mock( 'calypso/state/selectors/is-vip-site', () => ( {
	__esModule: true,
	default: () => mockIsVip,
} ) );

let mockAdminUrl: string | null =
	'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';
jest.mock( 'calypso/state/sites/selectors/get-site-admin-url', () => ( {
	__esModule: true,
	default: () => mockAdminUrl,
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

const EVENT_NAME = 'calypso_stats_premium_analytics_preview_notice_not_shown';

const renderNotices = () => render( <StatsNotices siteId={ 123 } isOdysseyStats={ false } /> );

const notShownEvents = () =>
	mockRecordTracksEvent.mock.calls.filter( ( [ name ] ) => name === EVENT_NAME );

describe( 'premium analytics preview "not shown" event', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Object.keys( mockFlags() ).forEach( ( flag ) => delete mockFlags()[ flag ] );
		mockFlags()[ 'stats/premium-analytics-preview' ] = true;
		mockNoticesVisibility = {
			isLoading: false,
			isError: false,
			data: { premium_analytics_preview: true } as unknown as Notices,
		};
		mockPremiumAnalyticsStatus = { data: false, isLoading: false, isError: false };
		mockCanManageOptions = true;
		mockSiteFeatures = { active: [] };
		mockIsWpcom = true;
		mockIsP2 = false;
		mockIsVip = false;
		mockAdminUrl = 'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';
	} );

	it( 'records the flag being off', () => {
		delete mockFlags()[ 'stats/premium-analytics-preview' ];

		renderNotices();

		expect( notShownEvents() ).toEqual( [
			[ EVENT_NAME, { blog_id: 123, reason: 'flag_disabled' } ],
		] );
	} );

	it( 'records a site whose Jetpack never registered the setting', () => {
		mockPremiumAnalyticsStatus = { data: undefined, isLoading: false, isError: false };

		renderNotices();

		expect( notShownEvents() ).toEqual( [
			[ EVENT_NAME, { blog_id: 123, reason: 'setting_unavailable' } ],
		] );
	} );

	it( 'records a site that already switched the dashboard on', () => {
		mockPremiumAnalyticsStatus = { data: true, isLoading: false, isError: false };

		renderNotices();

		expect( notShownEvents() ).toEqual( [
			[ EVENT_NAME, { blog_id: 123, reason: 'already_enabled' } ],
		] );
	} );

	it( 'records the server holding the invitation back', () => {
		mockNoticesVisibility = {
			isLoading: false,
			isError: false,
			data: { premium_analytics_preview: false } as unknown as Notices,
		};

		renderNotices();

		expect( notShownEvents() ).toEqual( [
			[ EVENT_NAME, { blog_id: 123, reason: 'server_hidden' } ],
		] );
	} );

	it( 'records only once across re-renders', () => {
		mockPremiumAnalyticsStatus = { data: true, isLoading: false, isError: false };

		const { rerender } = renderNotices();
		rerender( <StatsNotices siteId={ 123 } isOdysseyStats={ false } /> );

		expect( notShownEvents() ).toHaveLength( 1 );
	} );

	it( 'stays quiet when the invitation is shown', () => {
		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );

	it( 'stays quiet while the notices are still loading', () => {
		mockNoticesVisibility = { isLoading: true, isError: false, data: undefined as never };
		mockPremiumAnalyticsStatus = { data: undefined, isLoading: true, isError: false };

		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );

	it( 'stays quiet when the notices request failed', () => {
		mockNoticesVisibility = { isLoading: false, isError: true, data: undefined as never };

		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );

	it( 'stays quiet for a self-hosted Jetpack site', () => {
		mockIsWpcom = false;

		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );
} );
