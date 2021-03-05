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

			expect( currentUserId ).toBe( 73705554 );
		} );
	} );

	describe( 'isUserLoggedIn', () => {
		test( 'should return true if we have a non-null user id', () => {
			expect(
				isUserLoggedIn( {
					currentUser: { id: 1234 },
				} )
			).toBe( true );
		} );

		test( 'should return false if we have a null user id', () => {
			expect(
				isUserLoggedIn( {
					currentUser: { id: null },
				} )
			).toBe( false );
		} );
	} );
	describe( '#getCurrentUser()', () => {
		test( 'should return null if no current user', () => {
			const selected = getCurrentUser( {
				currentUser: {
					id: null,
				},
			} );

			expect( selected ).toBeNull();
		} );

		test( 'should return the object for the current user', () => {
			const selected = getCurrentUser( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014' },
				},
			} );

			expect( selected ).toEqual( { ID: 73705554, login: 'testonesite2014' } );
		} );
	} );

	describe( '#getCurrentUserLocale', () => {
		test( 'should return null if the current user is not set', () => {
			const locale = getCurrentUserLocale( {
				currentUser: {
					id: null,
				},
			} );

			expect( locale ).toBeNull();
		} );

		test( 'should return null if the current user locale slug is not set', () => {
			const locale = getCurrentUserLocale( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014' },
				},
			} );

			expect( locale ).toBeNull();
		} );

		test( 'should return the current user locale slug', () => {
			const locale = getCurrentUserLocale( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014', localeSlug: 'fr' },
				},
			} );

			expect( locale ).toBe( 'fr' );
		} );
	} );

	describe( '#getCurrentUserLocaleVariant', () => {
		test( 'should return null if the current user is not set', () => {
			const locale = getCurrentUserLocaleVariant( {
				currentUser: {
					id: null,
				},
			} );

			expect( locale ).toBeNull();
		} );

		test( 'should return null if the current user locale slug is not set', () => {
			const locale = getCurrentUserLocaleVariant( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014' },
				},
			} );

			expect( locale ).toBeNull();
		} );

		test( 'should return the current user locale variant slug', () => {
			const locale = getCurrentUserLocaleVariant( {
				currentUser: {
					id: 73705554,
					user: {
						ID: 73705554,
						login: 'testonesite2014',
						localeSlug: 'fr',
						localeVariant: 'fr_formal',
					},
				},
			} );

			expect( locale ).toBe( 'fr_formal' );
		} );
	} );

	describe( 'getCurrentUserDate()', () => {
		test( 'should return the current user registration date', () => {
			const currentUserDate = getCurrentUserDate( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014', date: '2014-10-18T17:14:52+00:00' },
				},
			} );

			expect( currentUserDate ).toBe( '2014-10-18T17:14:52+00:00' );
		} );

		test( 'should return null if the registration date is missing', () => {
			const currentUserDate = getCurrentUserDate( {
				currentUser: {
					id: 73705554,
					user: { ID: 73705554, login: 'testonesite2014' },
				},
			} );

			expect( currentUserDate ).toBeNull();
		} );

		test( 'should return null if the user is missing', () => {
			const currentUserDate = getCurrentUserDate( {
				currentUser: {
					id: 73705554,
					user: { ID: 12345678, login: 'testuser' },
				},
			} );

			expect( currentUserDate ).toBeNull();
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

			expect( isValid ).toBeNull();
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

			expect( isValid ).toBe( true );
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

			expect( isValid ).toBe( false );
		} );
	} );

	describe( 'getCurrentUserCurrencyCode', () => {
		test( 'should return null if currencyCode is not set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: null,
				},
			} );
			expect( selected ).toBeNull();
		} );
		test( 'should return value if currencyCode is set', () => {
			const selected = getCurrentUserCurrencyCode( {
				currentUser: {
					currencyCode: 'USD',
				},
			} );
			expect( selected ).toBe( 'USD' );
		} );
	} );

	describe( 'getCurrentUserEmail', () => {
		test( 'should return a null it the current user is not there for whatever reasons', () => {
			const selected = getCurrentUserEmail( {
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).toBeNull();
		} );

		test( 'should return a null if the primary email is not set', () => {
			const selected = getCurrentUserEmail( {
				currentUser: {
					id: 123456,
					user: { ID: 123456 },
				},
			} );

			expect( selected ).toBeNull();
		} );

		test( 'should return value if the email is set', () => {
			const testEmail = 'test@example.com';
			const selected = getCurrentUserEmail( {
				currentUser: {
					id: 123456,
					user: {
						ID: 123456,
						email: testEmail,
					},
				},
			} );

			expect( selected ).toBe( testEmail );
		} );
	} );

	describe( 'isCurrentUserBootstrapped', () => {
		test( 'should return false it the current user is not there for whatever reasons', () => {
			const selected = isCurrentUserBootstrapped( {
				currentUser: {
					id: 123456,
				},
			} );

			expect( selected ).toBe( false );
		} );

		test( 'should return false if the user was not bootstrapped', () => {
			const selected = isCurrentUserBootstrapped( {
				currentUser: {
					id: 123456,
					user: {
						ID: 123456,
						bootstrapped: false,
					},
				},
			} );

			expect( selected ).toBe( false );
		} );

		test( 'should return true if the user was bootstrapped', () => {
			const selected = isCurrentUserBootstrapped( {
				currentUser: {
					id: 123456,
					user: {
						ID: 123456,
						bootstrapped: true,
					},
				},
			} );

			expect( selected ).toBe( true );
		} );
	} );
} );
