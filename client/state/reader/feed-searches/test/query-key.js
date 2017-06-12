/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */

import { requestFeedSearch, SORT_BY_LAST_UPDATED } from '../actions';
import queryKey from '../query-key';

describe( 'query-key', () => {
	it( 'should generate the expected query keys', () => {
		[
			[ requestFeedSearch( { query: 'one' } ), 'one-X' ],
			[ requestFeedSearch( { query: 'one', offset: 10 } ), 'one-X' ],
			[ requestFeedSearch( { query: 'one', excludeFollowed: false } ), 'one-A' ],
			[
				requestFeedSearch( { query: 'one', excludeFollowed: false, sort: SORT_BY_LAST_UPDATED } ),
				'one-A',
			],
		].forEach( ( [ action, expectedKey ] ) => {
			expect( queryKey( action.payload ) ).to.equal( expectedKey );
		} );
	} );
} );
