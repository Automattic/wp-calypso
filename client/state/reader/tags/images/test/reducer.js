/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, requesting } from '../reducer';
import {
	READER_TAG_IMAGES_RECEIVE,
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
} from 'calypso/state/reader/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should insert a new image for a new tag', () => {
			const original = {
				banana: [ { url: 'http://example.com/banana1.png' } ],
			};
			const newImage = {
				url: 'http://example.com/apple1.png',
			};
			const state = items( original, {
				type: READER_TAG_IMAGES_RECEIVE,
				images: [ newImage ],
				tag: 'apple',
			} );

			expect( state.apple[ 0 ] ).to.eql( newImage );
		} );

		test( 'should insert a new image for an existing tag', () => {
			const original = {
				banana: [ { url: 'http://example.com/banana1.png' } ],
			};
			const newImage = {
				url: 'http://example.com/banana2.png',
			};
			const state = items( original, {
				type: READER_TAG_IMAGES_RECEIVE,
				images: [ newImage ],
				tag: 'banana',
			} );

			expect( state.banana[ 1 ] ).to.eql( newImage );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should index requesting state by tag', () => {
			const tag = 'banana';
			const state = requesting( undefined, {
				type: READER_TAG_IMAGES_REQUEST,
				tag,
			} );
			expect( state ).to.eql( {
				banana: true,
			} );
		} );

		test( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				pineapple: false,
			} );
			const state = requesting( original, {
				type: READER_TAG_IMAGES_REQUEST,
				tag: 'pen',
			} );
			expect( state ).to.eql( {
				pineapple: false,
				pen: true,
			} );
		} );

		test( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				pineapple: false,
				pen: true,
			} );
			const state = requesting( original, {
				type: READER_TAG_IMAGES_REQUEST_SUCCESS,
				tag: 'pen',
			} );

			expect( state ).to.eql( {
				pineapple: false,
				pen: false,
			} );
		} );
	} );
} );
