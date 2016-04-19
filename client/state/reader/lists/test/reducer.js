/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_LISTS_RECEIVE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION
} from 'state/action-types';

import {
	items,
	updatedLists
} from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should index lists by ID', () => {
			const state = items( null, {
				type: READER_LISTS_RECEIVE,
				lists: [
					{ ID: 841, title: 'Hello World' },
					{ ID: 413, title: 'Mangos and feijoas' }
				]
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' }
			} );
		} );

		it( 'should accumulate lists', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: READER_LISTS_RECEIVE,
				lists: [ { ID: 413, title: 'Mangos and feijoas' } ]
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Mangos and feijoas' }
			} );
		} );

		it( 'should update a list title', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_TITLE,
				listId: 841,
				title: 'Bananas'
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas' }
			} );
		} );

		it( 'should update a list description', () => {
			const original = deepFreeze( {
				841: { ID: 841, title: 'Bananas' }
			} );
			const state = items( original, {
				type: READER_LIST_UPDATE_DESCRIPTION,
				listId: 841,
				title: 'Bananas',
				description: 'This is a list about fruit'
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Bananas', description: 'This is a list about fruit' }
			} );
		} );
	} );

	describe( '#updatedLists()', () => {
		it( 'should default to an empty array', () => {
			const state = updatedLists( undefined, {} );
			expect( state ).to.eql( [] );
		} );

		it( 'should add a list ID when a list is updated', () => {
			const state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World'
					}
				}
			} );

			expect( state ).to.eql( [ 841 ] );
		} );

		it( 'should remove a list ID when a notice is dismissed', () => {
			let state = updatedLists( null, {
				type: READER_LIST_UPDATE_SUCCESS,
				data: {
					list: {
						ID: 841,
						title: 'Hello World'
					}
				}
			} );

			expect( state ).to.eql( [ 841 ] );

			state = updatedLists( null, {
				type: READER_LIST_DISMISS_NOTICE,
				listId: 841
			} );

			expect( state ).to.eql( [] );
		} );
	} );
} );
