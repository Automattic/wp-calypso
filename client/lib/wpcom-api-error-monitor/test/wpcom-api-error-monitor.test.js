/**
 * Tests for WPCOM API Error Monitor
 */

jest.mock( 'calypso/lib/user/store', () => ( {
	clearStore: jest.fn().mockResolvedValue( undefined ),
} ) );
jest.mock( 'calypso/lib/user/shared-utils', () => ( {
	getLogoutUrl: jest.fn( () => 'https://example.com/logout' ),
} ) );
jest.mock( 'calypso/lib/paths', () => ( {
	login: jest.fn( () => '/log-in' ),
} ) );

import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { clearStore } from 'calypso/lib/user/store';
import { WPCOMApiErrorMonitor } from 'calypso/lib/wpcom-api-error-monitor';

describe( 'WPCOMApiErrorMonitor', () => {
	let tracker;

	const flushPromises = () =>
		new Promise( ( resolve ) => {
			setImmediate( resolve );
		} );

	beforeEach( () => {
		// Reset window.location before each test
		delete window.location;
		window.location = { href: '', origin: 'https://wordpress.com' };

		jest.clearAllMocks();

		// Mock Redux store
		const mockStore = {
			getState: jest.fn( () => ( {
				currentUser: {
					user: {
						logout_URL: 'https://example.com/logout?_wpnonce=nonce',
						localeSlug: 'en',
					},
				},
			} ) ),
		};
		jest
			.spyOn( require( 'calypso/lib/redux-bridge' ), 'getReduxStore' )
			.mockReturnValue( mockStore );

		// Create tracker with test configuration
		tracker = new WPCOMApiErrorMonitor( {
			timeWindow: 10000, // 10 seconds for testing
			maxErrors: 3,
			trackedStatusCodes: [ 403, 500, 502, 503 ],
		} );
	} );

	describe( 'error tracking', () => {
		test( 'should track errors with tracked status codes', () => {
			const error = { status: 500, message: 'Server error' };

			const result = tracker.trackError( error );

			expect( result ).toBe( false ); // Threshold not exceeded yet
			expect( tracker.errors.length ).toBe( 1 );
		} );

		test( 'should ignore errors with untracked status codes', () => {
			const error = { status: 404, message: 'Not found' };

			const result = tracker.trackError( error );

			expect( result ).toBe( false );
			expect( tracker.errors.length ).toBe( 0 );
		} );
	} );

	describe( 'threshold detection', () => {
		test( 'should trigger threshold after max errors in time window', async () => {
			const error = { status: 500, message: 'Server error' };

			// Track errors up to the threshold
			tracker.trackError( error );
			expect( clearStore ).not.toHaveBeenCalled();

			tracker.trackError( error );
			expect( clearStore ).not.toHaveBeenCalled();

			tracker.trackError( error );
			expect( clearStore ).not.toHaveBeenCalled();

			// Fourth error should trigger threshold (max is 3)
			const result = tracker.trackError( error );

			expect( result ).toBe( true );
			await flushPromises();
			expect( clearStore ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'time window management', () => {
		test( 'should remove old errors outside time window', () => {
			const error = { status: 500, message: 'Server error' };

			// Add an error
			tracker.trackError( error );
			expect( tracker.errors.length ).toBe( 1 );

			// Manually set the timestamp of the first error to be old
			tracker.errors[ 0 ].timestamp = Date.now() - 20000; // 20 seconds ago

			// Add another error - should trigger cleanup
			tracker.trackError( error );

			// Old error should be removed, only new error remains
			expect( tracker.errors.length ).toBe( 1 );
			expect( tracker.errors[ 0 ].timestamp ).toBeGreaterThan( Date.now() - 1000 );
		} );
	} );

	describe( 'logout behaviour', () => {
		test( 'should clear store and redirect on logout', async () => {
			const error = { status: 500, message: 'Server error' };

			// Trigger threshold
			tracker.trackError( error );
			tracker.trackError( error );
			tracker.trackError( error );
			tracker.trackError( error );
			await flushPromises();

			expect( clearStore ).toHaveBeenCalled();
			expect( getLogoutUrl ).toHaveBeenCalledWith(
				{
					logout_URL: 'https://example.com/logout?_wpnonce=nonce',
					localeSlug: 'en',
				},
				'/log-in'
			);
			expect( window.location.href ).toBe( 'https://example.com/logout' );
		} );
	} );
} );
