import { describe, expect, test, jest } from '@jest/globals';
import {
	getRandomInteger,
	getAccountCredential,
	getCalypsoURL,
	getAccountSiteURL,
	getNewTestUser,
	toTitleCase,
	createSuiteTitle,
} from '../data-helper';
import { SecretsManager } from '../secrets';
import type { Secrets } from '../secrets';

const fakeSecrets = {
	gmailTestEmail: 'a8c.e2e@gmail.com',
	testAccounts: {
		basicUser: {
			username: 'wpcomuser2',
			password: 'hunter2',
			primarySite: 'wpcomuser.wordpress.com/',
		},
		noUrlUser: {
			username: 'nourluser',
			password: 'password1234',
		},
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

describe( 'DataHelper Tests', function () {
	describe( 'Test: getRandomInteger', function () {
		type TestCase = { min: number; max: number; expected: number[] };
		test.each< TestCase >`
			min    | max      | expected
			${ 0 } | ${ 0 }   | ${ [ 0 ] }
			${ 0 } | ${ 1 }   | ${ [ 0, 1 ] }
			${ 0 } | ${ 200 } | ${ [ ...Array( 200 ).keys() ] }
		`( 'Generated integer is within $min and $max ranges', function ( { min, max, expected } ) {
			const generated = getRandomInteger( min, max );
			expect( generated ).toBeGreaterThanOrEqual( min );
			expect( expected.includes( generated ) );
		} );
	} );

	describe( 'Test: getNewTestUser', function () {
		// What wpcom keeps of a Gmail-aliased address when it derives the username
		// of a passwordless signup: the local part, sanitized to alphanumerics and
		// cut at 40 characters (`Passwordless_Helpers::generate_username`).
		const deriveUsername = ( email: string ) =>
			email
				.split( '@' )[ 0 ]
				.replace( /[^a-z0-9]/gi, '' )
				.slice( 0, 40 );

		test.each( [ '', 'blackbox', 'ftmepersonal' ] )(
			'The username wpcom derives for the "%s" prefix keeps the whole address',
			function ( usernamePrefix ) {
				const { email } = getNewTestUser( { usernamePrefix } );
				const localPart = email.split( '@' )[ 0 ].replace( /[^a-z0-9]/gi, '' );

				// Anything past the cut is lost, and what is lost here is the
				// timestamp and random suffix that make the user unique: two users
				// generated milliseconds apart are then handed the same username and
				// the second signup fails with `username_reserved_but_may_be_available`
				// or `user_already_exists`.
				expect( deriveUsername( email ) ).toBe( localPart );
			}
		);

		test( 'The username stays inside the test-account namespace', function () {
			const { username } = getNewTestUser( { usernamePrefix: 'ftmepersonal' } );

			// wpcom gates test accounts on this prefix, e.g. discarding their Tracks
			// events (`WPCOM_Tracks_Client::should_discard`).
			expect( username.startsWith( 'e2eflowtesting' ) ).toBe( true );
		} );

		// Base addresses that spend the 40 characters wpcom reads before the
		// namespace is written: the first leaves the budget short of it, the second
		// takes the budget negative, which makes an unclamped `slice` trim from the
		// end and stop cutting altogether.
		test.each( [ 'e2e.flow.testing.suite@gmail.com', 'e2e.flow.testing.suite.account@gmail.com' ] )(
			'The namespace survives the base address %s leaving no room for it',
			function ( gmailTestEmail ) {
				const baseEmail = fakeSecrets.gmailTestEmail;
				fakeSecrets.gmailTestEmail = gmailTestEmail;

				try {
					const { username } = getNewTestUser( { usernamePrefix: 'ftmepersonal' } );
					// The prefix gives way; the namespace must not, or teardown will
					// not close the account it makes (`RestAPIClient.closeAccount`).
					expect( username.startsWith( 'e2eflowtesting' ) ).toBe( true );
				} finally {
					fakeSecrets.gmailTestEmail = baseEmail;
				}
			}
		);
	} );

	describe( 'Test: getCalypsoURL', function () {
		type Params = Parameters< typeof getCalypsoURL >;
		test.each< { route: Params[ 0 ]; queryStrings: Params[ 1 ]; expected: string } >`
			route           | queryStrings                               | expected
			${ '/' }        | ${ undefined }                             | ${ 'http://calypso.localhost:3000/' }
			${ 'log-in' }   | ${ undefined }                             | ${ 'http://calypso.localhost:3000/log-in' }
			${ 'post/new' } | ${ { param: 'test' } }                     | ${ 'http://calypso.localhost:3000/post/new?param=test' }
			${ 'post/new' } | ${ { param: 'test', query: 'jest-test' } } | ${ 'http://calypso.localhost:3000/post/new?param=test&query=jest-test' }
			${ 'post/new' } | ${ { param: 'ASCIIではありません' } }      | ${ 'http://calypso.localhost:3000/post/new?param=ASCII%E3%81%A7%E3%81%AF%E3%81%82%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93' }
		`(
			'Returns $expected if getCalypsoURL is called with $route and $queryStrings',
			function ( { route, queryStrings, expected } ) {
				expect( getCalypsoURL( route, queryStrings ) ).toBe( expected );
			}
		);
	} );

	describe( 'Test: getAccountCredential', function () {
		type AccountType = Parameters< typeof getAccountCredential >[ 0 ];
		test.each< { accountType: AccountType; expected: string } >`
			accountType      | expected
			${ 'basicUser' } | ${ { username: 'wpcomuser2', password: 'hunter2', totpKey: undefined } }
			${ 'noUrlUser' } | ${ { username: 'nourluser', password: 'password1234', totpKey: undefined } }
		`(
			'Returns $expected if getAccountCredential is called with $accountType',
			function ( { accountType, expected } ) {
				expect( getAccountCredential( accountType ) ).toStrictEqual( expected );
			}
		);

		test.each< { accountType: AccountType } >`
			accountType
			${ 'nonexistent_user' }
		`(
			'Throws error if getAccountCredential is called with $accountType',
			function ( { accountType } ) {
				expect( () => getAccountCredential( accountType ) ).toThrow();
			}
		);
	} );

	describe( 'Test: getAccountSiteURL', function () {
		type AccountType = Parameters< typeof getAccountCredential >[ 0 ];
		type TestCase = { accountType: AccountType; expected: string };
		test.each< TestCase >`
			accountType      | expected
			${ 'basicUser' } | ${ 'https://wpcomuser.wordpress.com/' }
		`(
			'Returns $expected if getAccountSiteURL is called with $accountType',
			function ( { accountType, expected } ) {
				expect( getAccountSiteURL( accountType ) ).toStrictEqual( expected );
			}
		);

		test.each< TestCase >`
			accountType             | expected
			${ 'nonexistent_user' } | ${ Error }
			${ 'noUrlUser' }        | ${ ReferenceError }
		`(
			'Throws error if getAccountSiteURL is called with $accountType',
			function ( { accountType, expected } ) {
				expect( () => getAccountSiteURL( accountType ) ).toThrow( expected );
			}
		);
	} );

	describe( 'Test: toTitleCase', function () {
		test.each< { words: string; expected: string } >`
			words                        | expected
			${ 'test' }                  | ${ 'Test' }
			${ 'test words' }            | ${ 'Test Words' }
			${ [ 'test', 'words' ] }     | ${ 'Test Words' }
			${ 'Test Words Third' }      | ${ 'Test Words Third' }
			${ '11 Words Third' }        | ${ '11 Words Third' }
			${ [ '12', '33', 'ABCDE' ] } | ${ '12 33 ABCDE' }
		`( 'Returns $expected if toTitleCase is called with $words', function ( { words, expected } ) {
			expect( toTitleCase( words ) ).toStrictEqual( expected );
		} );
	} );

	describe( 'Test: createSuiteTitle', function () {
		test.each`
			suite                       | viewport       | expected
			${ 'Feature (Click: Tap)' } | ${ 'desktop' } | ${ 'Feature (Click: Tap)' }
			${ 'Manage' }               | ${ 'mobile' }  | ${ 'Manage' }
		`(
			'Returns $expected if toTitleCase is called with $words',
			function ( { suite, viewport, expected } ) {
				process.env.TARGET_DEVICE = viewport;
				expect( createSuiteTitle( suite ) ).toStrictEqual( expected );
			}
		);
	} );
} );
