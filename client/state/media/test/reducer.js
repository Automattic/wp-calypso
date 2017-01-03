/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { MEDIA_DELETE, MEDIA_RECEIVE } from 'state/action-types';
import reducer, { items } from '../reducer';

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
} );
