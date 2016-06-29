/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getCurrentUserId,
	getCurrentUser,
	getCurrentUserLocale,
	isValidCapability,
	canCurrentUser,
	getCurrentUserCurrencyCode
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getCurrentUserId()', () => {
		it( 'should return the current user ID', () => {
			const currentUserId = getCurrentUserId( {
				currentUser: {
					id: 73705554
				}
			} );

			expect( currentUserId ).to.equal( 73705554 );
		} );
	} );

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

	describe( 'isValidCapability()', () => {
		it( 'should return null if the site is not known', () => {
			const isValid = isValidCapability( {
				currentUser: {
					capabilities: {}
				}
			}, 2916284, 'manage_options' );

			expect( isValid ).to.be.null;
		} );

		it( 'should return true if the capability is valid', () => {
			const isValid = isValidCapability( {
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false
						}
					}
				}
			}, 2916284, 'manage_options' );

			expect( isValid ).to.be.true;
		} );

		it( 'should return false if the capability is invalid', () => {
			const isValid = isValidCapability( {
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false
						}
					}
				}
			}, 2916284, 'manage_foo' );

			expect( isValid ).to.be.false;
		} );
	} );

	describe( 'canCurrentUser', () => {
		it( 'should return null if the site is not known', () => {
			const isCapable = canCurrentUser( {
				currentUser: {
					capabilities: {}
				}
			}, 2916284, 'manage_options' );

			expect( isCapable ).to.be.null;
		} );

		it( 'should return the value for the specified capability', () => {
			const isCapable = canCurrentUser( {
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false
						}
					}
				}
			}, 2916284, 'manage_options' );

			expect( isCapable ).to.be.false;
		} );

		it( 'should return null if the capability is invalid', () => {
			const isCapable = canCurrentUser( {
				currentUser: {
					capabilities: {
						2916284: {
							manage_options: false
						}
					}
				}
			}, 2916284, 'manage_foo' );

			expect( isCapable ).to.be.null;
		} );
	} );

	describe( 'getCurrentUserCurrencyCode', () => {
		it( 'should return null if currencyCode is not set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: null
				}
			} );
			expect( selected ).to.equal( null );
		} );
		it( 'should return value if currencyCode is set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: 'USD'
				}
			} );
			expect( selected ).to.equal( 'USD' );
		} );
	} );
} );
