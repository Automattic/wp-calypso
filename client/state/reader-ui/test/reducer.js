import {
	READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
	READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
} from '../action-types';
import { lastActionRequiresLogin } from '../reducer';

describe( 'state/reader-ui/reducer', () => {
	const lastAction = {
		type: 'like',
		siteId: 123,
		postId: 456,
	};

	beforeEach( () => {
		if ( typeof window === 'undefined' ) {
			global.window = {};
		}

		const localStorageMock = {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
		};

		Object.defineProperty( window, 'localStorage', {
			value: localStorageMock,
			writable: true,
		} );

		// Reset the Date.now to return a consistent value
		jest.spyOn( Date, 'now' ).mockImplementation( () => 1610000000000 );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		// Clean up the global window
		if ( global.window ) {
			delete global.window;
		}
	} );

	describe( 'items()', () => {
		test( 'should store the lastAction field', () => {
			const state = lastActionRequiresLogin( undefined, {
				type: READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
				lastAction,
			} );

			expect( window.localStorage.setItem ).toHaveBeenCalledWith(
				'wp-reader-pending-signup-action',
				expect.stringContaining( '"type":"like"' )
			);

			expect( state ).toEqual( lastAction );
		} );

		test( 'should clear the stored data', () => {
			const state = lastAction;

			const updated = lastActionRequiresLogin( state, {
				type: READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
			} );

			expect( window.localStorage.removeItem ).toHaveBeenCalledWith(
				'wp-reader-pending-signup-action'
			);

			expect( updated ).toEqual( null );
		} );
	} );
} );
