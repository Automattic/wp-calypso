/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_THUMBNAIL_REQUEST,
	READER_THUMBNAIL_REQUEST_SUCCESS,
	READER_THUMBNAIL_REQUEST_FAILURE,
	READER_THUMBNAIL_RECEIVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { items, requesting } from '../reducer';

describe( 'reducer', () => {
	const embedUrl = 'embedUrl';
	const thumbnailUrl = 'thumbnailUrl';

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should insert a new thumbnailUrl for a new embedUrl', () => {
			const state = items( {}, {
				type: READER_THUMBNAIL_RECEIVE,
				embedUrl,
				thumbnailUrl,
			} );

			expect( state[ embedUrl ] ).to.eql( thumbnailUrl );
		} );

		it( 'should not insert anything for an error', () => {
			const state = items( {}, {
				type: READER_THUMBNAIL_REQUEST_FAILURE,
				embedUrl,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by embedUrl', () => {
			const state = requesting( {}, {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl,
			} );

			expect( state ).to.eql( {
				[ embedUrl ]: true
			} );
		} );

		it( 'should accumulate requesting state for thumbnails', () => {
			const original = deepFreeze( {
				[ embedUrl ]: true,
			} );
			const state = requesting( original, {
				type: READER_THUMBNAIL_REQUEST,
				embedUrl: embedUrl + '2',
			} );
			expect( state ).to.eql( {
				[ embedUrl ]: true,
				[ embedUrl + '2' ]: true
			} );
		} );

		it( 'should set requesting to false when done requesting', () => {
			const original = deepFreeze( {
				[ embedUrl ]: true
			} );
			const state = requesting( original, {
				type: READER_THUMBNAIL_REQUEST_SUCCESS,
				embedUrl,
			} );

			expect( state ).to.eql( {
				[ embedUrl ]: false,
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					[ embedUrl ]: true,
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					[ embedUrl ]: true,
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
