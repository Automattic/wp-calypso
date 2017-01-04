/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUESTING } from 'state/action-types';
import reducer, { items, queryRequests } from '../reducer';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'queries',
			'queryRequests'
		] );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should key received media items by site ID, media ID', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: MEDIA_RECEIVE,
				siteId: 2916284,
				media: [ { ID: 42, title: 'flowers' } ]
			} );

			expect( state ).to.eql( {
				2916284: {
					42: {
						ID: 42,
						title: 'flowers'
					}
				}
			} );
		} );

		it( 'should remove deleted media by site ID, media ID', () => {
			const original = deepFreeze( {
				2916284: {
					42: {
						ID: 42,
						title: 'flowers'
					}
				}
			} );

			const state = items( original, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state ).to.eql( {
				2916284: {}
			} );
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
			2916284: [ MediaQueryManager.QueryKey.stringify( query1 ) ]
		};

		const state2 = {
			2916284: [
				...state1[ 2916284 ],
				MediaQueryManager.QueryKey.stringify( query2 )
			]
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
	} );
} );
