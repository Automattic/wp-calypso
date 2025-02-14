/**
 * @jest-environment jsdom
 */

import accessibleFocus from '@automattic/accessible-focus';
import Login from 'calypso/blocks/login';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

// Mock the accessible-focus module
jest.mock( '@automattic/accessible-focus', () => jest.fn() );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'Login', () => {
	beforeEach( () => {
		// Clear mock calls before each test
		jest.clearAllMocks();
	} );

	test( 'calls accessibleFocus on mount', () => {
		render(
			<Login
				isJetpack={ false }
				isWhiteLogin={ false }
				isJetpackWooCommerceFlow={ false }
				rebootAfterLogin={ () => {} }
				sendEmailLogin={ () => {} }
			/>
		);

		expect( accessibleFocus ).toHaveBeenCalledTimes( 1 );
	} );
} );
