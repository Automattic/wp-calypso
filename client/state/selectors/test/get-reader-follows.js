/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getReaderFollows } from '../';

describe( 'getReaderFollows()', () => {
	const state = {
		reader: {
			follows: {
				items: {
					'discovererror.wordpress.com': {
						URL: 'http://discovererror.wordpress.com',
						error: 'invalid_feed',
					},
					'discover.wordpress.com': {
						URL: 'http://discover.wordpress.com',
					},
				},
			},
		},
	};

	it( 'should not return follows with an error set', () => {
		const follows = getReaderFollows( state );
		expect( follows ).to.eql( [
			{
				URL: 'http://discover.wordpress.com',
			},
		] );
	} );
} );
