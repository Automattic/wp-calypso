/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_SET_VISIBILITY
} from 'state/action-types';
import {
	showReaderFullPost,
	hideReaderFullPost
} from '../actions';

describe( 'actions', () => {
	describe( '#showReaderFullPost()', () => {
		it( 'should dispatch correct action', () => {
			const action = showReaderFullPost();

			expect( action.type ).to.eql( READER_FULLPOST_SET_VISIBILITY );
			expect( action.show ).to.eql( true );
		} );
	} );

	describe( '#hideReaderFullPost()', () => {
		it( 'should dispatch correct action', () => {
			const action = hideReaderFullPost();

			expect( action.type ).to.eql( READER_FULLPOST_SET_VISIBILITY );
			expect( action.show ).to.eql( false );
		} );
	} );
} );
