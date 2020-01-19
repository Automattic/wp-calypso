/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { queries, queryRequests, mediaItemRequests } from '../reducer';
import MediaQueryManager from 'lib/query-manager/media';
import {
	DESERIALIZE,
	MEDIA_DELETE,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_RECEIVE,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_REQUESTING,
	SERIALIZE,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'queries',
			'queryRequests',
			'mediaItemRequests',
		] );
	} );

	describe( 'queries()', () => {
		const items = [
			{
				ID: 42,
				title: 'flowers',
			},
		];

		const query1 = {
			search: 'flower',
		};

		const query2 = {
			search: 'flowers',
		};

		const action1 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query1,
		};

		const action2 = {
			type: MEDIA_RECEIVE,
			siteId: 2916284,
			media: items,
			found: 1,
			query: query2,
		};

		test( 'should default to an empty object', () => {
			const state = queries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track media receive', () => {
			const state = queries( deepFreeze( {} ), action1 );

			expect( state ).to.have.keys( '2916284' );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.eql( items );
		} );

		test( 'should accumulate query requests', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action2 );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems( query1 ) ).to.have.length( 1 );
			expect( state[ 2916284 ].getItems( query2 ) ).to.have.length( 1 );
		} );

		test( 'should return the same state if successful request has no changes', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, action1 );

			expect( state ).to.equal( previousState );
		} );

		test( 'should track posts even if not associated with a query', () => {
			const state = queries( deepFreeze( {} ), {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				media: items,
			} );

			expect( state ).to.have.keys( [ '2916284' ] );
			expect( state[ 2916284 ] ).to.be.an.instanceof( MediaQueryManager );
			expect( state[ 2916284 ].getItems() ).to.eql( items );
		} );

		test( 'should update received posts', () => {
			const updatedItem = {
				ID: 42,
				title: 'test',
			};

			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				...action1,
				media: [ updatedItem ],
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).to.eql( updatedItem );
		} );

		test( 'should remove item when post delete action success dispatched', () => {
			const previousState = deepFreeze( queries( deepFreeze( {} ), action1 ) );
			const state = queries( previousState, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state[ 2916284 ].getItem( 42 ) ).to.be.undefined;
			expect( state[ 2916284 ].getItems() ).to.be.empty;
		} );
	} );

	describe( 'queryRequests()', () => {
		const query1 = {
			search: 'flower',
		};

		const query2 = {
			search: 'flowers',
		};

		const state1 = {
			2916284: {
				[ MediaQueryManager.QueryKey.stringify( query1 ) ]: true,
			},
		};

		const state2 = {
			2916284: {
				...state1[ 2916284 ],
				[ MediaQueryManager.QueryKey.stringify( query2 ) ]: true,
			},
		};

		test( 'should default to an empty object', () => {
			const state = queryRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track media requesting', () => {
			const state = queryRequests( deepFreeze( {} ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query1,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should accumulate queries', () => {
			const state = queryRequests( deepFreeze( state1 ), {
				type: MEDIA_REQUESTING,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state2 );
		} );

		test( 'should track media request success', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_REQUEST_SUCCESS,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should track media request failures', () => {
			const state = queryRequests( deepFreeze( state2 ), {
				type: MEDIA_REQUEST_FAILURE,
				siteId: 2916284,
				query: query2,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should never persist state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = queryRequests( deepFreeze( state1 ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'mediaItemRequests()', () => {
		const state1 = {
			2916284: {
				[ 10 ]: true,
			},
		};

		const state2 = {
			2916284: {
				...state1[ 2916284 ],
				[ 20 ]: true,
			},
		};

		test( 'should default to an empty object', () => {
			const state = mediaItemRequests( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track media item requesting', () => {
			const state = mediaItemRequests( deepFreeze( {} ), {
				type: MEDIA_ITEM_REQUESTING,
				siteId: 2916284,
				mediaId: 10,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should accumulate requests', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), {
				type: MEDIA_ITEM_REQUESTING,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state2 );
		} );

		test( 'should track media request success', () => {
			const state = mediaItemRequests( deepFreeze( state2 ), {
				type: MEDIA_ITEM_REQUEST_SUCCESS,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should track media request failures', () => {
			const state = mediaItemRequests( deepFreeze( state2 ), {
				type: MEDIA_ITEM_REQUEST_FAILURE,
				siteId: 2916284,
				mediaId: 20,
			} );

			expect( state ).to.deep.eql( state1 );
		} );

		test( 'should never persist state', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should never load persisted state', () => {
			const state = mediaItemRequests( deepFreeze( state1 ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
