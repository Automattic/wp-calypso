/**
 * @jest-environment jsdom
 */
import { premiumAnalyticsStatusRequest } from '../use-premium-analytics-status-query';

const mockIsEnabled = jest.fn();
jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: () => undefined,
	isEnabled: ( flag: string ) => mockIsEnabled( flag ),
} ) );

describe( 'premiumAnalyticsStatusRequest', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'goes through the WordPress.com proxy in Calypso, with the site in the path', () => {
		mockIsEnabled.mockReturnValue( false );

		expect( premiumAnalyticsStatusRequest( 123 ) ).toEqual( {
			apiNamespace: 'wp/v2',
			path: '/sites/123/settings',
		} );
	} );

	/**
	 * Odyssey's XHR wrapper rewrites any namespace outside its local allow-list to
	 * `jetpack/v4/stats-app`, where this route does not exist. `isLocalApiCall` is what keeps
	 * `wp/v2` intact, so without it the request 404s and the whole feature is dead in wp-admin.
	 */
	it( 'addresses the site directly in Odyssey, keeping the namespace', () => {
		mockIsEnabled.mockReturnValue( true );

		expect( premiumAnalyticsStatusRequest( 123 ) ).toEqual( {
			apiNamespace: 'wp/v2',
			path: '/settings',
			isLocalApiCall: true,
		} );
		expect( mockIsEnabled ).toHaveBeenCalledWith( 'is_running_in_jetpack_site' );
	} );
} );
