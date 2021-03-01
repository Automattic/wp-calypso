/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, currentPage, lastPage, inflightPages } from '../reducer';
import {
	READER_SITE_BLOCK,
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_BLOCKS_REQUEST,
	READER_SITE_UNBLOCK,
	READER_SITE_REQUEST_SUCCESS,
} from 'calypso/state/reader/action-types';

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

	describe( '#currentPage()', () => {
		test( 'should default to 1', () => {
			const state = currentPage( undefined, {} );
			expect( state ).toEqual( 1 );
		} );

		test( 'should update from a successful page response', () => {
			const original = deepFreeze( {} );

			const state = currentPage( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: { page: 4 },
			} );

			expect( state ).toEqual( 4 );
		} );
	} );

	describe( '#lastPage()', () => {
		test( 'should default to null', () => {
			const state = lastPage( undefined, {} );
			expect( state ).toEqual( null );
		} );

		test( 'should not update when a page with some items is received', () => {
			const original = null;

			const state = lastPage( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: { page: 4, count: 2 },
			} );

			expect( state ).toEqual( null );
		} );

		test( 'should update when a page with no items is received', () => {
			const original = null;

			const state = lastPage( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: { page: 5, count: 0 },
			} );

			expect( state ).toEqual( 5 );
		} );
	} );

	describe( '#inflightPages()', () => {
		test( 'should default to an empty object', () => {
			const state = inflightPages( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should update when a page request is made', () => {
			const original = deepFreeze( { 2: true } );

			const state = inflightPages( original, {
				type: READER_SITE_BLOCKS_REQUEST,
				payload: { page: 4 },
			} );

			expect( state ).toEqual( { 2: true, 4: true } );
		} );

		test( 'should remove a page when a page response is received', () => {
			const original = deepFreeze( { 2: true } );

			const state = inflightPages( original, {
				type: READER_SITE_BLOCKS_RECEIVE,
				payload: { page: 4 },
			} );

			expect( state ).toEqual( original );
		} );
	} );
} );
