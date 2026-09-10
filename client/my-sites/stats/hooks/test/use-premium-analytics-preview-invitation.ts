/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePremiumAnalyticsPreviewInvitation from '../use-premium-analytics-preview-invitation';

// The flag store is created inside the factory and parked on `globalThis`: modules read config
// while they are being imported, before any module-scope `const` here exists.
jest.mock( '@automattic/calypso-config', () => {
	const flags: Record< string, boolean > = {};
	( globalThis as Record< string, unknown > ).__previewInvitationTestFlags = flags;
	const isEnabled = ( flag: string ) => !! flags[ flag ];
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const mockFlags = () =>
	( globalThis as Record< string, unknown > ).__previewInvitationTestFlags as Record<
		string,
		boolean
	>;

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

// An administrator on a WordPress.com site with commercial Stats and a wp-admin to land in.
let mockIsWpcom = true;
let mockIsAtomic = false;
let mockCanManageOptions = true;
let mockSiteFeatures: object | null = { active: [] };
let mockIsGated = false;
let mockAdminUrl: string | null =
	'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';

jest.mock( 'calypso/state/sites/selectors/is-jetpack-site', () => ( {
	__esModule: true,
	default: ( _state: unknown, _siteId: number, options: { treatAtomicAsJetpackSite: boolean } ) =>
		mockIsAtomic && options.treatAtomicAsJetpackSite,
} ) );

jest.mock( 'calypso/state/selectors/is-site-wpcom', () => ( {
	__esModule: true,
	default: () => mockIsWpcom,
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpforteams', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/selectors/is-vip-site', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: () => mockCanManageOptions,
} ) );
jest.mock( 'calypso/state/selectors/get-site-features', () => ( {
	__esModule: true,
	default: () => mockSiteFeatures,
} ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-should-gate-stats', () => ( {
	shouldGateStats: () => mockIsGated,
} ) );
jest.mock( 'calypso/state/sites/selectors/get-site-admin-url', () => ( {
	__esModule: true,
	default: () => mockAdminUrl,
} ) );
jest.mock( 'calypso/state/sites/selectors/get-site-option', () => ( {
	__esModule: true,
	default: () => undefined,
} ) );

let mockStatus: boolean | undefined = false;
const mockUseStatusQuery = jest.fn();
jest.mock( 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => {
		mockUseStatusQuery( ...args );
		return { data: mockStatus };
	},
} ) );

const invitation = () =>
	renderHook( () => usePremiumAnalyticsPreviewInvitation( 123 ) ).result.current;

describe( 'usePremiumAnalyticsPreviewInvitation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockFlags()[ 'stats/premium-analytics-preview' ] = true;
		mockIsWpcom = true;
		mockIsAtomic = false;
		delete mockFlags()[ 'stats/premium-analytics-preview-atomic' ];
		mockCanManageOptions = true;
		mockSiteFeatures = { active: [] };
		mockIsGated = false;
		mockAdminUrl = 'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin';
		mockStatus = false;
	} );

	it( 'invites an administrator on a cohort site that has not switched on yet', () => {
		expect( invitation() ).toEqual( {
			isInvited: true,
			dashboardUrl:
				'https://example.com/wp-admin/admin.php?page=jetpack-premium-analytics-wp-admin',
		} );
		expect( mockUseStatusQuery ).toHaveBeenCalledWith( 123, true );
	} );

	it.each( [
		[ true, false, false ],
		[ true, true, true ],
		[ false, false, true ],
		[ false, true, true ],
	] )( 'Atomic %s with flag %s requests status: %s', ( isAtomic, flag, expected ) => {
		mockIsAtomic = isAtomic;
		mockFlags()[ 'stats/premium-analytics-preview-atomic' ] = flag;

		expect( invitation().isInvited ).toBe( expected );
		expect( mockUseStatusQuery ).toHaveBeenCalledWith( 123, expected );
	} );

	it( 'does not invite a site that already has the dashboard', () => {
		mockStatus = true;

		expect( invitation().isInvited ).toBe( false );
	} );

	/**
	 * Undefined means the site never reported the setting - a Jetpack too old to register it, or a
	 * read that failed. Not the same as off.
	 */
	it( 'stays quiet when the site never reported the setting', () => {
		mockStatus = undefined;

		expect( invitation().isInvited ).toBe( false );
	} );

	it( 'spends no request on a site outside the cohort', () => {
		mockIsWpcom = false;

		expect( invitation().isInvited ).toBe( false );
		expect( mockUseStatusQuery ).toHaveBeenCalledWith( 123, false );
	} );

	it( 'spends no request while the flag is off', () => {
		delete mockFlags()[ 'stats/premium-analytics-preview' ];

		expect( invitation().isInvited ).toBe( false );
		expect( mockUseStatusQuery ).toHaveBeenCalledWith( 123, false );
	} );

	it( 'does not invite anyone who cannot switch it on', () => {
		mockCanManageOptions = false;

		expect( invitation().isInvited ).toBe( false );
	} );

	it( 'waits for site features before trusting the commercial gate', () => {
		mockSiteFeatures = null;

		expect( invitation().isInvited ).toBe( false );
	} );

	it( 'does not invite a site without commercial Stats', () => {
		mockIsGated = true;

		expect( invitation().isInvited ).toBe( false );
	} );

	it( 'does not invite a site with nowhere to land', () => {
		mockAdminUrl = null;

		expect( invitation() ).toEqual( { isInvited: false, dashboardUrl: null } );
	} );
} );
