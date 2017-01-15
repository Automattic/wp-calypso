/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUESTING,
	MEDIA_SELECTED_SET,
	SERIALIZE } from 'state/action-types';
import reducer, { queries, queryRequests, selected } from '../reducer';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'queries',
			'queryRequests',
			'selected'
		] );
	} );

	describe( 'queries()', () => {
		const items = [ {
			ID: 42,
			title: 'flowers'
		} ];

		const query1 = {
			search: 'flower'
		};

		const query2 = {
			search: 'flowers'
		};

		const action1 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query1
		};

		const action2 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query2
		};

		it( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track media receive', () => {
			const state = queries( deepFreeze( {} ), action1 );

			expect( state ).to.have.keys( '2916284' );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.eql( items );
		} );

		it( 'should accumulate query requests', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action2 );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( query2 ) ).to.have.length( 1 );
		} );

		it( 'should return the same state if successful request has no changes', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action1 );

			expect( state ).to.equal( previousState );
		} );

		it( 'should track posts even if not associated with a query', () => {
			const state = queries( deepFreeze( {} ), {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				media: items
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems() ).to.eql( items );
		} );

		it( 'should update received posts', () => {
			const updatedItem = {
				ID: 42,
				title: 'test'
			};

			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				...action1,
				media: [ updatedItem ]
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).to.eql( updatedItem );
		} );

		it( 'should remove item when post delete action success dispatched', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).to.be.undefined;
			expect( state[ 2916284 ].getItems() ).to.be.empty;
		} );
	} );

	describe( 'queryRequests()', () => {
		const query1 = {
			search: 'flower'
		};

		const query2 = {
			search: 'flowers'
		};

		const state1 = {
			2916284: {
				[ MediaQueryManager.QueryKey.stringify( query1 ) ]: true
			}
		};

		const state2 = {
			2916284: {
				...state1[ 2916284 ],
				[ MediaQueryManager.QueryKey.stringify( query2 ) ]: true
			}
		};

		it( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track media requesting', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query1
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		it( 'should accumulate queries', () => {
			const state = queryRequests( deepFreeze( state1 ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query2
			} );

			expect( state ).to.deep.eql( state2 );
		} );

		it( 'should track media receiving', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				query: query2
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		it( 'should track media request failures', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_REQUEST_FAILURE,
				siteId: 2916284,
				query: query2
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		it( 'should never persist state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'selected()', () => {
		it( 'should default to an empty object', () => {
			const state = selected( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set selected media', () => {
			const state = selected( deepFreeze( {} ), {
				type: MEDIA_SELECTED_SET,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state ).to.eql( {
				2916284: [ 42 ]
			} );
		} );

		it( 'should not accumulate selected media when setting', () => {
			const state = selected( deepFreeze( {
				2916284: [ 42 ]
			} ), {
				type: MEDIA_SELECTED_SET,
				siteId: 2916284,
				mediaIds: [ 43 ]
			} );

			expect( state ).to.eql( {
				2916284: [ 43 ]
			} );
		} );

		it( 'should remove deleted media', () => {
			const state = selected( deepFreeze( {
				2916284: [ 42, 43, 44 ]
			} ), {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 43 ]
			} );

			expect( state ).to.eql( {
				2916284: [ 42, 44 ]
			} );
		} );

		it( 'should never load persisted state', () => {
			const state = selected( deepFreeze( {
				2916284: [ 42 ]
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
