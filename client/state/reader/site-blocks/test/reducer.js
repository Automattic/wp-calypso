/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	READER_SITE_BLOCK,
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_UNBLOCK,
	READER_SITE_REQUEST_SUCCESS,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update for a successful block', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_BLOCK,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );

		test( 'should update for a successful unblock', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_UNBLOCK,
				payload: { siteId: 123 },
			} );

			expect( state[ 123 ] ).toBeUndefined();
		} );

		test( 'should add a new block from a successful site request', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 123, is_blocked: true },
			} );

			expect( state[ 123 ] ).toEqual( true );
		} );

		test( 'should remove a block from a successful site request', () => {
			const original = deepFreeze( { 123: true } );

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 123, is_blocked: false },
			} );

			expect( state[ 123 ] ).toBeUndefined();
		} );

		test( 'should make no changes from a successful site request with is_blocked false', () => {
			const original = deepFreeze( {} );

			const state = items( original, {
				type: READER_SITE_REQUEST_SUCCESS,
				payload: { ID: 123, is_blocked: false },
			} );

			expect( state[ 123 ] ).toBeUndefined();
		} );

		test( 'should make no changes from an empty site blocks listing request', () => {
			const original = deepFreeze( { 122: true, 123: true, 124: false } );

			const state = items( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: {},
			} );

			expect( state ).toEqual( original );
		} );

		test( 'should add new blocks from a successful site blocks listing request', () => {
			const original = deepFreeze( { 122: true, 123: true, 124: false } );

			const state = items( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: {
					sites: [
						{ ID: 123, name: 'Example', URL: 'http://example.com' },
						{ ID: 124, name: 'Example2', URL: 'http://example2.com' },
						{ ID: 125, name: 'Example3', URL: 'http://example3.com' },
					],
				},
			} );

			expect( state ).toEqual( { 122: true, 123: true, 124: true, 125: true } );
		} );
	} );
} );
