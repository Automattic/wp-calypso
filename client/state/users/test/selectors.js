/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getUser } from '../selectors';

describe( 'selectors', () => {
	describe( '#getUser()', () => {
		test( 'should return the object for the user ID', () => {
			const user = getUser(
				{
					users: {
						items: {
							73705554: { ID: 73705554, login: 'testonesite2014' },
						},
					},
				},
				73705554
			);

			expect( user ).to.eql( { ID: 73705554, login: 'testonesite2014' } );
		} );
	} );
} );
