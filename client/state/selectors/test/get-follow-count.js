/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getFollowCount
} from '../';

describe( 'getFollowCount()', () => {
	it( 'should return zero if nothing has been followed', () => {
		const count = getFollowCount( {
			reader: {
				follows: {
					items: {},
				}
			}
		} );

		expect( count ).to.eq( 0 );
	} );

	it( 'should return the count if something has been followed', () => {
		const count = getFollowCount( {
			reader: {
				follows: {
					items: {
						'http://discover.wordpress.com': { is_following: true },
						'http://dailypost.wordpress.com': { is_following: false },
						'http://postcardsfromthereader.wordpress.com': { is_following: true },
					},
				}
			}
		} );

		expect( count ).to.eq( 2 );
	} );
} );
