/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import QueryUserConnection from 'calypso/components/data/query-user-connection';

const mockIsUserConnected = jest.fn( () => ( { type: 'IS_USER_CONNECTED' } ) );

jest.mock( 'calypso/state/jetpack-connect/actions', () => ( {
	isUserConnected: ( ...args ) => mockIsUserConnected( ...args ),
} ) );

const siteId = 123;
const mockStore = configureStore( [ thunk ] );

describe( 'QueryUserConnection', () => {
	beforeEach( () => {
		mockIsUserConnected.mockClear();
	} );

	test( 'checks the user connection while another request for the site is in flight', () => {
		const store = mockStore( { sites: { requesting: { [ siteId ]: true } } } );

		render(
			<Provider store={ store }>
				<QueryUserConnection siteId={ siteId } siteIsOnSitesList />
			</Provider>
		);

		expect( mockIsUserConnected ).toHaveBeenCalledWith( siteId, true );
	} );
} );
