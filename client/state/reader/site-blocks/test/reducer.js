/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_BLOCK_REQUEST_FAILURE,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { items, requesting } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should reflect a successful block', () => {
			const original = {};

			const state = items( original, {
				type: READER_SITE_BLOCK_REQUEST_SUCCESS,
				data: { success: true },
				siteId: 123
			} );

			expect( state[ 123 ] ).to.eql( true );
		} );

		it( 'should not change for a failed block', () => {
			const original = {};

			const state = items( original, {
				type: READER_SITE_BLOCK_REQUEST_FAILURE,
				data: { success: false },
				siteId: 123
			} );

			expect( state[ 123 ] ).to.be.not.ok;
		} );

		it( 'should reflect a successful unblock', () => {
			const original = {};

			const state = items( original, {
				type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
				data: { success: true },
				siteId: 123
			} );

			expect( state[ 123 ] ).to.eql( false );
		} );

		it( 'should not change for a failed unblock', () => {
			const original = {
				123: true
			};

			const state = items( original, {
				type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
				data: { success: false },
				siteId: 123
			} );

			expect( state[ 123 ] ).to.eql( true );
		} );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index requesting state by site ID', () => {
			const siteId = 123;
			const state = requesting( undefined, {
				type: READER_SITE_BLOCK_REQUEST,
				siteId
			} );
			expect( state ).to.eql( {
				123: true
			} );
		} );

		it( 'should accumulate requesting state for sites', () => {
			const original = deepFreeze( {
				123: false
			} );
			const state = requesting( original, {
				type: READER_SITE_BLOCK_REQUEST,
				siteId: 124
			} );
			expect( state ).to.eql( {
				123: false,
				124: true
			} );
		} );

		it( 'should override previous requesting state', () => {
			const original = deepFreeze( {
				123: false,
				124: true
			} );
			const state = requesting( original, {
				type: READER_SITE_BLOCK_REQUEST_SUCCESS,
				siteId: 124
			} );

			expect( state ).to.eql( {
				123: false,
				124: false
			} );
		} );

		describe( 'persistence', () => {
			it( 'never persists state', () => {
				const original = deepFreeze( {
					123: true
				} );
				const state = requesting( original, { type: SERIALIZE } );
				expect( state ).to.eql( {} );
			} );

			it( 'never loads persisted state', () => {
				const original = deepFreeze( {
					123: true
				} );
				const state = requesting( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
