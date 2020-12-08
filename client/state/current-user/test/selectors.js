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
	getCurrentUserLocaleVariant,
	getCurrentUserDate,
	isUserLoggedIn,
	isValidCapability,
	getCurrentUserCurrencyCode,
	getCurrentUserEmail,
	isCurrentUserBootstrapped,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'getCurrentUserId()', () => {
		test( 'should return the current user ID', () => {
			const currentUserId = getCurrentUserId( {
				currentUser: {
					id: 73705554,
				},
			} );

			expect( currentUserId ).to.equal( 73705554 );
		} );
	} );

	describe( 'isUserLoggedIn', () => {
		test( 'should return true if we have a non-null user id', () => {
			expect(
				isUserLoggedIn( {
					currentUser: { id: 1234 },
				} )
			).to.be.true;
		} );

		test( 'should return false if we have a null user id', () => {
			expect(
				isUserLoggedIn( {
					currentUser: { id: null },
				} )
			).to.be.false;
		} );
	} );
	describe( '#getCurrentUser()', () => {
		test( 'should return null if no current user', () => {
			const selected = getCurrentUser( {
				currentUser: {
					id: null,
				},
			} );

			expect( selected ).to.be.null;
		} );

		test( 'should return the object for the current user', () => {
			const selected = getCurrentUser( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( selected ).to.eql( { ID: 73705554, login: 'testonesite2014' } );
		} );
	} );

	describe( '#getCurrentUserLocale', () => {
		test( 'should return null if the current user is not set', () => {
			const locale = getCurrentUserLocale( {
				currentUser: {
					id: null,
				},
			} );

			expect( locale ).to.be.null;
		} );

		test( 'should return null if the current user locale slug is not set', () => {
			const locale = getCurrentUserLocale( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( locale ).to.be.null;
		} );

		test( 'should return the current user locale slug', () => {
			const locale = getCurrentUserLocale( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014', localeSlug: 'fr' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( locale ).to.equal( 'fr' );
		} );
	} );

	describe( '#getCurrentUserLocaleVariant', () => {
		test( 'should return null if the current user is not set', () => {
			const locale = getCurrentUserLocaleVariant( {
				currentUser: {
					id: null,
				},
			} );

			expect( locale ).to.be.null;
		} );

		test( 'should return null if the current user locale slug is not set', () => {
			const locale = getCurrentUserLocaleVariant( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( locale ).to.be.null;
		} );

		test( 'should return the current user locale variant slug', () => {
			const locale = getCurrentUserLocaleVariant( {
				users: {
					items: {
						73705554: {
							ID: 73705554,
							login: 'testonesite2014',
							localeSlug: 'fr',
							localeVariant: 'fr_formal',
						},
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( locale ).to.equal( 'fr_formal' );
		} );
	} );

	describe( 'getCurrentUserDate()', () => {
		test( 'should return the current user registration date', () => {
			const currentUserDate = getCurrentUserDate( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014', date: '2014-10-18T17:14:52+00:00' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( currentUserDate ).to.equal( '2014-10-18T17:14:52+00:00' );
		} );

		test( 'should return null if the registration date is missing', () => {
			const currentUserDate = getCurrentUserDate( {
				users: {
					items: {
						73705554: { ID: 73705554, login: 'testonesite2014' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( currentUserDate ).to.be.null;
		} );

		test( 'should return null if the user is missing', () => {
			const currentUserDate = getCurrentUserDate( {
				users: {
					items: {
						12345678: { ID: 12345678, login: 'testuser' },
					},
				},
				currentUser: {
					id: 73705554,
				},
			} );

			expect( currentUserDate ).to.be.null;
		} );
	} );

	describe( 'isValidCapability()', () => {
		test( 'should return null if the site is not known', () => {
			const isValid = isValidCapability(
				{
					currentUser: {
						capabilities: {},
					},
				},
				2916284,
				'manage_options'
			);

			expect( isValid ).to.be.null;
		} );

		test( 'should return true if the capability is valid', () => {
			const isValid = isValidCapability(
				{
					currentUser: {
						capabilities: {
							2916284: {
								manage_options: false,
							},
						},
					},
				},
				2916284,
				'manage_options'
			);

			expect( isValid ).to.be.true;
		} );

		test( 'should return false if the capability is invalid', () => {
			const isValid = isValidCapability(
				{
					currentUser: {
						capabilities: {
							2916284: {
								manage_options: false,
							},
						},
					},
				},
				2916284,
				'manage_foo'
			);

			expect( isValid ).to.be.false;
		} );
	} );

	describe( 'getCurrentUserCurrencyCode', () => {
		test( 'should return null if currencyCode is not set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: null,
				},
			} );
			expect( selected ).to.equal( null );
		} );
		test( 'should return value if currencyCode is set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: 'USD',
				},
			} );
			expect( selected ).to.equal( 'USD' );
		} );
	} );

	describe( 'getCurrentUserEmail', () => {
		test( 'should return a null it the current user is not there for whatever reasons', () => {
			const selected = getCurrentUserEmail( {
				users: {
					items: {},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( null );
		} );

		test( 'should return a null if the primary email is not set', () => {
			const selected = getCurrentUserEmail( {
				users: {
					items: {
						123456: {
							ID: 123456,
						},
					},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( null );
		} );

		test( 'should return value if the email is set', () => {
			const testEmail = 'test@example.com';
			const selected = getCurrentUserEmail( {
				users: {
					items: {
						123456: {
							ID: 123456,
							email: testEmail,
						},
					},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( testEmail );
		} );
	} );

	describe( 'isCurrentUserBootstrapped', () => {
		test( 'should return false it the current user is not there for whatever reasons', () => {
			const selected = isCurrentUserBootstrapped( {
				users: {
					items: {},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( false );
		} );

		test( 'should return false if the user was not bootstrapped', () => {
			const selected = isCurrentUserBootstrapped( {
				users: {
					items: {
						123456: {
							ID: 123456,
							bootstrapped: false,
						},
					},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( false );
		} );

		test( 'should return true if the user was bootstrapped', () => {
			const selected = isCurrentUserBootstrapped( {
				users: {
					items: {
						123456: {
							ID: 123456,
							bootstrapped: true,
						},
					},
				},
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).to.equal( true );
		} );
	} );
} );
