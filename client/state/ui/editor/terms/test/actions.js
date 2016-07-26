/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_TERM_ADDED_SET } from 'state/action-types';
import { setEditorAddedTerm, resetEditorTermAdded } from '../actions';

describe( 'actions', () => {
	describe( '#setEditorAddedTerm()', () => {
		it( 'should return an action object', () => {
			const action = setEditorAddedTerm( 2916284, 841, 'wookies', 111 );

			expect( action ).to.eql( {
				type: EDITOR_TERM_ADDED_SET,
				siteId: 2916284,
				postId: 841,
				taxonomy: 'wookies',
				termId: 111
			} );
		} );
	} );

	describe( '#resetEditorTermAdded()', () => {
		it( 'should return an action object', () => {
			const action = resetEditorTermAdded( 2916284, 841, 'wookies' );

			expect( action ).to.eql( {
				type: EDITOR_TERM_ADDED_SET,
				siteId: 2916284,
				postId: 841,
				taxonomy: 'wookies',
				termId: null
			} );
		} );
	} );
} );
