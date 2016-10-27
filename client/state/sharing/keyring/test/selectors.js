/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getKeyringConnections,
	getKeyringConnectionById,
	getKeyringConnectionsByName,
	getUserConnections,
	getAvailableExternalConnections,
	isKeyringConnectionsFetching
} from '../selectors';

describe( 'selectors', () => {
	const defaultState = {
		sharing: {
			keyring: {
				items: {},
				isFetching: false,
			}
		}
	};
	const activeState = {
		currentUser: {
			id: 26957695,
		},
		sharing: {
			keyring: {
				items: {
					1: { ID: 1, service: 'twitter', sites: [ '2916284' ], additional_external_users: [] },
					2: { ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1, additional_external_users: [] },
					3: { ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
				},
				isFetching: true,
			},
			publicize: {
				connectionsBySiteId: {
					2916284: [ 1, 2, 3 ]
				},
				connections: {
					1: { ID: 1, site_ID: 2916284, shared: true },
					2: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695 },
				}
			}
		},
		ui: {
			selectedSiteId: 2916284,
		},
	};

	describe( 'getKeyringConnections()', () => {
		it( 'should return false if connections have not been fetched', () => {
			const connections = getKeyringConnections( defaultState );

			expect( connections ).to.be.empty;
		} );

		it( 'should return the keyring connections', () => {
			const connections = getKeyringConnections( activeState );

			expect( connections ).to.eql( [
				{ ID: 1, service: 'twitter', sites: [ '2916284' ], additional_external_users: [] },
				{ ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1, additional_external_users: [] },
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
			] );
		} );
	} );

	describe( 'getKeyringConnectionById()', () => {
		it( 'should return null for a connection which has not yet been fetched', () => {
			const connections = getKeyringConnectionById( activeState, 4 );

			expect( connections ).to.be.null;
		} );

		it( 'should return the connection object for the ID', () => {
			const connections = getKeyringConnectionById( activeState, 1 );

			expect( connections ).to.eql(
				{ ID: 1, service: 'twitter', sites: [ '2916284' ], additional_external_users: [] },
			);
		} );
	} );

	describe( 'getKeyringConnectionsByName()', () => {
		it( 'should return null for a connection which has not yet been fetched', () => {
			const connections = getKeyringConnectionsByName( activeState, 'tumblr' );

			expect( connections ).to.be.empty;
		} );

		it( 'should return the connection object for the ID', () => {
			const connections = getKeyringConnectionsByName( activeState, 'facebook' );

			expect( connections ).to.eql( [
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
			] );
		} );
	} );

	describe( 'getUserConnections()', () => {
		it( 'should return an empty array for a site which has not yet been fetched', () => {
			activeState.sharing.keyring.items[ 3 ].shared = false;
			const connections = getUserConnections( activeState, 3 );
			activeState.sharing.keyring.items[ 3 ].shared = true;

			expect( connections ).to.eql( [] );
		} );

		it( 'should return an array of connection objects that are available to any user', () => {
			const connections = getUserConnections( activeState, 3 );

			expect( connections ).to.eql( [
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
			] );
		} );

		it( 'should return an array of connection objects that are available to a specific user', () => {
			const connections = getUserConnections( activeState, 1 );

			expect( connections ).to.eql( [
				{ ID: 2, service: 'insta', sites: [ '77203074' ], keyring_connection_user_ID: 1, additional_external_users: [] },
				{ ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
			] );
		} );
	} );

	describe( 'getAvailableExternalConnections()', () => {
		it( 'should return an empty array for a site which has not yet been fetched', () => {
			const connections = getAvailableExternalConnections( activeState, 'path' );

			expect( connections ).to.eql( [] );
		} );

		it( 'should return an array of connection objects that are available to any user', () => {
			const connections = getAvailableExternalConnections( activeState, 'twitter' );

			expect( connections ).to.eql( [
				{ isConnected: false, keyringConnectionId: 1, name: undefined, picture: undefined },
			] );
		} );
	} );

	describe( 'isKeyringConnectionsFetching()', () => {
		it( 'should return false if fetch has never been triggered', () => {
			const isFetching = isKeyringConnectionsFetching( defaultState );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return true if connections are currently fetching', () => {
			const isFetching = isKeyringConnectionsFetching( activeState );

			expect( isFetching ).to.be.true;
		} );

		it( 'should return false if connections are not currently fetching', () => {
			const isFetching = isKeyringConnectionsFetching( defaultState );

			expect( isFetching ).to.be.false;
		} );
	} );
} );
