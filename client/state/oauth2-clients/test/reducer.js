/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { clients, initialClientsData } from '../reducer';
import { OAUTH2_CLIENT_DATA_RECEIVE } from 'calypso/state/action-types';

describe( 'clients reducer', () => {
	// Uses default data but reduces the size of this data set for tests
	const initialState = pick( initialClientsData, [ 930, 973 ] );

	test( 'should return the current state for an unknown action type', () => {
		const newState = clients( initialState, { type: 'BUY_BURGER' } );

		expect( newState ).toBe( initialState );
	} );

	test( 'should return updated state with updated data when client data was fetched successful', () => {
		const newState = clients( initialState, {
			type: OAUTH2_CLIENT_DATA_RECEIVE,
			data: {
				id: 930,
				title: 'Vaultpress Pro',
				url: 'https://vaultpress.pro/',
			},
		} );

		expect( newState ).toEqual( {
			930: {
				id: 930,
				name: 'vaultpress',
				title: 'Vaultpress Pro',
				icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
				url: 'https://vaultpress.pro/',
			},
			973: {
				id: 973,
				name: 'akismet',
				title: 'Akismet',
				icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
			},
		} );
	} );

	test( 'should return updated state with new data when client data was fetched successful', () => {
		const newState = clients( initialState, {
			type: OAUTH2_CLIENT_DATA_RECEIVE,
			data: {
				id: 2665,
				title: 'IntenseDebate',
				url: 'https://intensedebate.com/',
				icon:
					'https://i0.wp.com/developer.files.wordpress.com/2013/04/idwp-feature-adminpanel.png?w=100',
			},
		} );

		expect( newState ).toEqual( {
			930: {
				id: 930,
				name: 'vaultpress',
				title: 'Vaultpress',
				icon: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
			},
			973: {
				id: 973,
				name: 'akismet',
				title: 'Akismet',
				icon: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
			},
			2665: {
				id: 2665,
				title: 'IntenseDebate',
				url: 'https://intensedebate.com/',
				icon:
					'https://i0.wp.com/developer.files.wordpress.com/2013/04/idwp-feature-adminpanel.png?w=100',
			},
		} );
	} );
} );
