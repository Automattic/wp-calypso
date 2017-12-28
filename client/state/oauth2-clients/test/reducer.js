/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import reducer, { initialClientsData } from '../reducer';
import {
	OAUTH2_CLIENT_DATA_REQUEST,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'client/state/action-types';

describe( 'reducer', () => {
	// Uses default data but reduces the size of this data set for tests
	const initialState = pick( initialClientsData, [ 930, 973 ] );

	test( 'should throw an error when no parameter is provided', () => {
		expect( () => reducer() ).to.throw( TypeError );
	} );

	test( 'should throw an error when no action is provided', () => {
		expect( () => reducer( {} ) ).to.throw( TypeError );
	} );

	test( 'should return the current state for an empty action', () => {
		const newState = reducer( initialState, {} );

		expect( newState ).to.be.eql( initialState );
	} );

	test( 'should return the current state for an unknown action type', () => {
		const newState = reducer( initialState, { type: 'BUY_BURGER' } );

		expect( newState ).to.be.eql( initialState );
	} );

	test( 'should return the current state when fetching client data starts', () => {
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST,
			clientId: 930,
		} );

		expect( newState ).to.deep.equal( initialState );
	} );

	test( 'should return updated state with updated data when client data was fetched successful', () => {
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
			data: {
				id: 930,
				title: 'Vaultpress Pro',
				url: 'https://vaultpress.pro/',
			},
		} );

		expect( newState ).to.deep.equal( {
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
		const newState = reducer( initialState, {
			type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
			data: {
				id: 2665,
				title: 'IntenseDebate',
				url: 'https://intensedebate.com/',
				icon:
					'https://i0.wp.com/developer.files.wordpress.com/2013/04/idwp-feature-adminpanel.png?w=100',
			},
		} );

		expect( newState ).to.deep.equal( {
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

	test( 'should not persist state', () => {
		const newState = reducer( undefined, {
			type: SERIALIZE,
		} );

		expect( newState ).to.deep.equal( initialClientsData );
	} );

	test( 'should not load persisted state', () => {
		const newState = reducer( undefined, {
			type: DESERIALIZE,
		} );

		expect( newState ).to.deep.equal( initialClientsData );
	} );
} );
