/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_TAG_IMAGES_REQUEST,
	READER_TAG_IMAGES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import {
	requesting
} from '../reducer';

describe( 'reducer', () => {
	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by tag', () => {
			const tag = 'banana';
			const state = requesting( undefined, {
				type: READER_TAG_IMAGES_REQUEST,
				tag
			} );
			expect( state ).to.eql( {
				banana: true
			} );
		} );

		it( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				pineapple: false
			} );
			const state = requesting( original, {
				type: READER_TAG_IMAGES_REQUEST,
				tag: 'pen'
			} );
			expect( state ).to.eql( {
				pineapple: false,
				pen: true
			} );
		} );

		it( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				pineapple: false,
				pen: true
			} );
			const state = requesting( original, {
				type: READER_TAG_IMAGES_REQUEST_SUCCESS,
				tag: 'pen'
			} );

			expect( state ).to.eql( {
				pineapple: false,
				pen: false
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					pineapple: false,
					pen: true
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					pineapple: false,
					pen: true
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
