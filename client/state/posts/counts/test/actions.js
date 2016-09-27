/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_COUNTS_RECEIVE,
} from 'state/action-types';
import {
	receivePostCounts,
} from '../actions';

describe( 'actions', () => {
	describe( '#receivePostCounts()', () => {
		it( 'should return an action object', () => {
			const counts = {
				all: { publish: 2 },
				mine: { publish: 1 }
			};
			const action = receivePostCounts( 2916284, 'post', counts );

			expect( action ).to.eql( {
				type: POST_COUNTS_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				counts
			} );
		} );
	} );
} );
