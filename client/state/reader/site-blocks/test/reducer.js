/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_BLOCK_REQUEST_FAILURE,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should optimistically update for a block attempt', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_BLOCK_REQUEST,
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.eql( true );
		} );

		test( 'should reflect a successful block', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_BLOCK_REQUEST_SUCCESS,
				data: { success: true },
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.eql( true );
		} );

		test( 'should not change for a failed block', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_BLOCK_REQUEST_FAILURE,
				data: { success: false },
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.be.not.ok;
		} );

		test( 'should optimistically update for an unblock attempt', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_UNBLOCK_REQUEST,
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.eql( false );
		} );

		test( 'should reflect a successful unblock', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
				data: { success: true },
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.eql( false );
		} );

		test( 'should not change for a failed unblock', () => {
			const original = deepFreeze( {
				123: true,
			} );

			const state = items( original, {
				type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
				data: { success: false },
				siteId: 123,
			} );

			expect( state[ 123 ] ).to.eql( true );
		} );
	} );
} );
