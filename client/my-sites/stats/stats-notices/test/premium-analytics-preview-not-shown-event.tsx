/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import StatsNotices from '../index';
import { recordedSiteIds } from '../premium-analytics-preview-not-shown-event';
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

// Empty by default so the gates alone decide; a case that needs the conflict group fills it in.
jest.mock( '../all-notice-definitions', () => {
	const definitions: unknown[] = [];
	( globalThis as Record< string, unknown > ).__notShownEventTestNotices = definitions;
	return { __esModule: true, default: definitions };
} );

const mockNoticeDefinitions = () =>
	( globalThis as Record< string, unknown > ).__notShownEventTestNotices as Array< {
		component: () => null;
		noticeId: string;
		isVisibleFunc: () => boolean;
		disabled: boolean;
	} >;

const noticeDefinition = ( noticeId: string, isVisible = true ) => ( {
	component: () => null,
	noticeId,
	isVisibleFunc: () => isVisible,
	disabled: false,
} );

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

let mockIsStatsGated = false;
jest.mock( 'calypso/my-sites/stats/hooks/use-should-gate-stats', () => ( {
	shouldGateStats: () => mockIsStatsGated,
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

let mockHasLoadedSiteFeatures = true;
jest.mock( 'calypso/state/selectors/has-loaded-site-features', () => ( {
	__esModule: true,
	default: () => mockHasLoadedSiteFeatures,
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
let mockIsAtomic = false;
jest.mock( 'calypso/state/sites/selectors/is-jetpack-site', () => ( {
	__esModule: true,
	default: ( _state: unknown, _siteId: number, options: { treatAtomicAsJetpackSite: boolean } ) =>
		mockIsAtomic && options.treatAtomicAsJetpackSite,
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
		mockIsAtomic = false;
		mockIsP2 = false;
		mockIsVip = false;
		mockAdminUrl = 'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';
		mockHasLoadedSiteFeatures = true;
		mockIsStatsGated = false;
		mockNoticeDefinitions().length = 0;
		recordedSiteIds.clear();
	} );

	const reasonCases: Array< [ string, () => void ] > = [
		[
			'server_hidden',
			() => {
				mockNoticesVisibility.data = { premium_analytics_preview: false } as unknown as Notices;
			},
		],
		[
			'no_admin_url',
			() => {
				mockAdminUrl = null;
			},
		],
		[
			'atomic_hold',
			() => {
				mockIsAtomic = true;
				mockPremiumAnalyticsStatus = { data: undefined, isLoading: true, isError: false };
			},
		],
		[
			'already_enabled',
			() => {
				mockPremiumAnalyticsStatus.data = true;
			},
		],
		[
			'status_request_failed',
			() => {
				mockPremiumAnalyticsStatus.isError = true;
			},
		],
		[
			'setting_unavailable',
			() => {
				mockPremiumAnalyticsStatus.data = undefined;
			},
		],
	];

	it.each( reasonCases )( 'records %s', ( reason, setUp ) => {
		setUp();

		renderNotices();

		expect( notShownEvents() ).toEqual( [ [ EVENT_NAME, { blog_id: 123, reason } ] ] );
	} );

	const quietCases: Array< [ string, () => void ] > = [
		[ 'the invitation is shown', () => {} ],
		// Fixed audience rules rather than stages of the rollout: outside them a site was never in
		// the running, and free sites alone would outnumber every reason worth reading.
		[
			'the site has no commercial Stats',
			() => {
				mockIsStatsGated = true;
			},
		],
		[
			'the site features are missing',
			() => {
				mockSiteFeatures = null;
			},
		],
		[
			'the user is not an administrator',
			() => {
				mockCanManageOptions = false;
			},
		],
		[
			'the site is VIP',
			() => {
				mockIsVip = true;
			},
		],
		[
			'the site is a P2',
			() => {
				mockIsP2 = true;
			},
		],
		// Even when the server would have hidden it: the audience rule comes first.
		[
			'the site is free and the server hides the invitation',
			() => {
				mockIsStatsGated = true;
				mockNoticesVisibility.data = { premium_analytics_preview: false } as unknown as Notices;
			},
		],
		// The two rows that would otherwise pass every gate, so a missing guard would leave them
		// silent for the wrong reason. Failing one gate gives each a reason to record.
		[
			'the flag is off',
			() => {
				mockAdminUrl = null;
				delete mockFlags()[ 'stats/premium-analytics-preview' ];
			},
		],
		[
			'the notices are still loading',
			() => {
				mockNoticesVisibility = { isLoading: true, isError: false, data: undefined as never };
				mockPremiumAnalyticsStatus = { data: undefined, isLoading: true, isError: false };
			},
		],
		[
			'the site features are still loading',
			() => {
				mockSiteFeatures = null;
				mockHasLoadedSiteFeatures = false;
			},
		],
		[
			'the site is self-hosted Jetpack',
			() => {
				mockAdminUrl = null;
				mockIsWpcom = false;
			},
		],
	];

	it.each( quietCases )( 'stays quiet while %s', ( _label, setUp ) => {
		setUp();

		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );

	it.each( [ true, false ] )( 'does not hold Simple with Atomic flag %s', ( flag ) => {
		mockFlags()[ 'stats/premium-analytics-preview-atomic' ] = flag;
		renderNotices();
		expect( notShownEvents() ).toEqual( [] );
	} );

	it( 'does not hold Atomic when its flag is on', () => {
		mockIsAtomic = true;
		mockFlags()[ 'stats/premium-analytics-preview-atomic' ] = true;
		renderNotices();
		expect( notShownEvents() ).toEqual( [] );
	} );

	it.each( [ true, undefined ] )( 'records atomic_hold before status %s', ( status ) => {
		mockIsAtomic = true;
		mockPremiumAnalyticsStatus.data = status;
		renderNotices();
		expect( notShownEvents() ).toEqual( [
			[ EVENT_NAME, { blog_id: 123, reason: 'atomic_hold' } ],
		] );
	} );

	it( 'stays quiet for a P2 even during the Atomic hold', () => {
		mockIsAtomic = true;
		mockIsP2 = true;
		renderNotices();
		expect( notShownEvents() ).toEqual( [] );
	} );

	describe( 'with another notice in the conflict group', () => {
		beforeEach( () => {
			mockNoticeDefinitions().push(
				noticeDefinition( 'gdpr_cookie_consent' ),
				noticeDefinition( 'premium_analytics_preview' )
			);
		} );

		it( 'records suppressed, naming the notice that outranked the invitation', () => {
			mockNoticesVisibility.data = {
				gdpr_cookie_consent: true,
				premium_analytics_preview: true,
			} as unknown as Notices;

			renderNotices();

			expect( notShownEvents() ).toEqual( [
				[ EVENT_NAME, { blog_id: 123, reason: 'suppressed', by: 'gdpr_cookie_consent' } ],
			] );
		} );

		it( 'stays quiet when the invitation wins the group', () => {
			mockNoticesVisibility.data = {
				gdpr_cookie_consent: false,
				premium_analytics_preview: true,
			} as unknown as Notices;

			renderNotices();

			expect( notShownEvents() ).toEqual( [] );
		} );

		// A gate failure is the reason a reader would reach first, and the site was never in the
		// running for the group to suppress.
		it( 'keeps the gate reason over suppressed', () => {
			mockNoticesVisibility.data = {
				gdpr_cookie_consent: true,
				premium_analytics_preview: false,
			} as unknown as Notices;

			renderNotices();

			expect( notShownEvents() ).toEqual( [
				[ EVENT_NAME, { blog_id: 123, reason: 'server_hidden' } ],
			] );
		} );
	} );

	it( 'stays quiet for a site that was offered the invitation and then dismissed it', () => {
		const { rerender } = renderNotices();

		// What a dismissal does: the mutation invalidates the notices query and the refetch answers
		// that the invitation is no longer on offer.
		mockNoticesVisibility = {
			isLoading: false,
			isError: false,
			data: { premium_analytics_preview: false } as unknown as Notices,
		};
		rerender( <StatsNotices siteId={ 123 } isOdysseyStats={ false } /> );

		expect( notShownEvents() ).toEqual( [] );
	} );

	it( 'stays quiet for a site that accepted the invitation and came back', () => {
		renderNotices();

		// Accepting writes the status cache without recording a dismissal, so the next Traffic mount
		// still sees the invitation on offer and the dashboard already on.
		mockPremiumAnalyticsStatus = { data: true, isLoading: false, isError: false };
		renderNotices();

		expect( notShownEvents() ).toEqual( [] );
	} );
} );
