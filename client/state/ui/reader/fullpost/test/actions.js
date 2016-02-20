/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_FULLPOST_HIDE,
	READER_FULLPOST_SHOW
} from 'state/action-types';
import {
	showReaderFullPost,
	hideReaderFullPost
} from '../actions';

describe( 'actions', () => {
	describe( '#showReaderFullPost()', () => {
		it( 'should dispatch correct action', () => {
			const action = showReaderFullPost();

			expect( action.type ).to.eql( READER_FULLPOST_SHOW );
		} );
	} );

	describe( '#hideReaderFullPost()', () => {
		it( 'should dispatch correct action', () => {
			const action = hideReaderFullPost();

			expect( action.type ).to.eql( READER_FULLPOST_HIDE );
		} );
	} );
} );
