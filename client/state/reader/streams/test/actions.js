/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { fetchPosts } from '../actions';
import { READER_STREAMS_PAGE_REQUEST } from 'state/action-types';

describe( 'actions', () => {
	it( 'fetch post', () => {
		expect( fetchPosts( 'following', { before: '1990-12-31' } ) ).to.eql( {
			type: READER_STREAMS_PAGE_REQUEST,
			streamId: 'following',
			range: { before: '1990-12-31' }
		} );
	} );
} );
