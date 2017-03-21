/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { requestPage } from '../actions';
import { READER_STREAMS_PAGE_REQUEST } from 'state/action-types';

describe( 'actions', () => {
	it( 'page request', () => {
		expect( requestPage( 'following', { before: '1990-12-31' } ) ).to.eql( {
			type: READER_STREAMS_PAGE_REQUEST,
			streamId: 'following',
			query: { before: '1990-12-31' }
		} );
	} );
} );
