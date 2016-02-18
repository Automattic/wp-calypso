/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getCurrentUser,
	getCurrentUserLocale
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getCurrentUser()', () => {
		it( 'should return null if no current user', () => {
			const selected = getCurrentUser( {
				currentUser: {
					id: null
				}
			} );

			expect( selected ).to.be.null;
		} );

		it( 'should return the object for the current user', () => {
			const selected = getCurrentUser( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' }
					}
				},
				currentUser: {
					id: 73705554
				}
			} );

			expect( selected ).to.eql( { ID: 73705554, login: 'testonesite2014' } );
		} );
	} );

	describe( '#getCurrentUserLocale', () => {
		it( 'should return null if the current user is not set', () => {
			const locale = getCurrentUserLocale( {
				currentUser: {
					id: null
				}
			} );

			expect( locale ).to.be.null;
		} );

		it( 'should return null if the current user locale slug is not set', () => {
			const locale = getCurrentUserLocale( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' }
					}
				},
				currentUser: {
					id: 73705554
				}
			} );

			expect( locale ).to.be.null;
		} );

		it( 'should return the current user locale slug', () => {
			const locale = getCurrentUserLocale( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'fr' }
					}
				},
				currentUser: {
					id: 73705554
				}
			} );

			expect( locale ).to.equal( 'fr' );
		} );
	} );
} );
