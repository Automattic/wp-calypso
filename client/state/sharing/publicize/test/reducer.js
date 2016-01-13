/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE
} from 'state/action-types';
import {
	fetchingConnections,
	connections,
	connectionsBySiteId
} from '../reducer';

describe( '#fetchingConnections()', () => {
	it( 'should set fetching to true for fetching action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_REQUEST,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.true;
	} );

	it( 'should set fetching to false for received action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.false;
	} );

	it( 'should set fetching to false for failed action', () => {
		const state = fetchingConnections( null, {
			type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
			siteId: 2916284
		} );

		expect( state[ 2916284 ] ).to.be.false;
	} );
} );

describe( '#connections()', () => {
	it( 'should index connections by ID', () => {
		const state = connections( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ { ID: 1, site_ID: 2916284 } ]
			}
		} );

		expect( state ).to.eql( {
			1: { ID: 1, site_ID: 2916284 }
		} );
	} );

	it( 'should not replace previous connections', () => {
		const state = connections( {
			1: { ID: 1, site_ID: 2916284 }
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ { ID: 2, site_ID: 2916284 } ]
			}
		} );

		expect( state ).to.eql( {
			1: { ID: 1, site_ID: 2916284 },
			2: { ID: 2, site_ID: 2916284 }
		} );
	} );

	it( 'should override previous connections of same ID', () => {
		const connection = { ID: 1, site_ID: 2916284, foo: true };
		const state = connections( {
			1: { ID: 1, site_ID: 2916284 }
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [ connection ]
			}
		} );

		expect( state ).to.eql( {
			1: connection
		} );
	} );
} );

describe( '#connectionsBySiteId()', () => {
	it( 'should map site ID to connection IDs', () => {
		const state = connectionsBySiteId( null, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 },
					{ ID: 2, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			2916284: [ 1, 2 ]
		} );
	} );

	it( 'should replace previous known connections for site', () => {
		const state = connectionsBySiteId( {
			2916284: [ 1, 2 ]
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			2916284: [ 1 ]
		} );
	} );

	it( 'should not replace known connections for unrelated sites', () => {
		const state = connectionsBySiteId( {
			77203074: [ 1, 2 ]
		}, {
			type: PUBLICIZE_CONNECTIONS_RECEIVE,
			siteId: 2916284,
			data: {
				connections: [
					{ ID: 1, site_ID: 2916284 }
				]
			}
		} );

		expect( state ).to.eql( {
			77203074: [ 1, 2 ],
			2916284: [ 1 ]
		} );
	} );
} );
