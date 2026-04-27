/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import { redirectMeToCurrentUser } from '../controller';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

const mockStore = configureStore();

describe( 'redirectMeToCurrentUser', () => {
	const next = jest.fn();

	const buildContext = ( path: string, username: string | null = 'deansas' ) =>
		( {
			path,
			store: mockStore( {
				currentUser: {
					id: username ? 1 : null,
					user: username ? { ID: 1, username } : null,
				},
			} ),
		} ) as unknown as Parameters< typeof redirectMeToCurrentUser >[ 0 ];

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'redirects /reader/users/me to the current user profile path', () => {
		redirectMeToCurrentUser( buildContext( '/reader/users/me' ), next );

		expect( page.redirect ).toHaveBeenCalledWith( '/reader/users/deansas' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects /reader/users/me/<view> preserving the view', () => {
		redirectMeToCurrentUser( buildContext( '/reader/users/me/achievements' ), next );

		expect( page.redirect ).toHaveBeenCalledWith( '/reader/users/deansas/achievements' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'falls through to next() when there is no current user', () => {
		redirectMeToCurrentUser( buildContext( '/reader/users/me', null ), next );

		expect( page.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
