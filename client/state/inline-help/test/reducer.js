import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import {
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_SET_SEARCH_QUERY,
} from 'calypso/state/action-types';
import { popover, search } from '../reducer';

describe( 'reducer', () => {
	describe( '#popover()', () => {
		test( 'should return the initial state', () => {
			const state = popover( undefined, {} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
		test( 'should generate isVisible boolean prop', () => {
			const state = popover( undefined, {
				type: INLINE_HELP_POPOVER_SHOW,
			} );

			expect( state ).to.eql( {
				isVisible: true,
			} );
		} );
		test( 'should the existing visible status', () => {
			const original = deepFreeze( { isVisible: true } );
			const state = popover( original, {
				type: INLINE_HELP_POPOVER_HIDE,
			} );

			expect( state ).to.eql( {
				isVisible: false,
			} );
		} );
	} );

	describe( '#search()', () => {
		test( 'should return the initial state', () => {
			const state = search( undefined, {} );
			expect( state ).to.eql( {
				searchQuery: '',
			} );
		} );
		test.each( [ 'testQueryKey', '' ] )(
			'should correctly set the current search query text',
			( testQuery ) => {
				const state = search( undefined, {
					type: INLINE_HELP_SET_SEARCH_QUERY,
					searchQuery: testQuery,
				} );

				expect( state ).to.eql( {
					searchQuery: testQuery,
				} );
			}
		);
	} );
} );
