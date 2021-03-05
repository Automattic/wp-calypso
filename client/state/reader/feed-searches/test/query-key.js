/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestFeedSearch, SORT_BY_LAST_UPDATED } from '../actions';
import queryKey from '../query-key';

describe( 'query-key', () => {
	test( 'should generate the expected query keys', () => {
		[
			[ requestFeedSearch( { query: 'one' } ), 'one-X-relevance' ],
			[ requestFeedSearch( { query: 'one', offset: 10 } ), 'one-X-relevance' ],
			[ requestFeedSearch( { query: 'one', excludeFollowed: false } ), 'one-A-relevance' ],
			[
				requestFeedSearch( { query: 'one', excludeFollowed: false, sort: SORT_BY_LAST_UPDATED } ),
				'one-A-last_updated',
			],
		].forEach( ( [ action, expectedKey ] ) => {
			expect( queryKey( action.payload ) ).to.equal( expectedKey );
		} );
	} );
} );
