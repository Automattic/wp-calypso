/**
 * External dependencies
 */
import { describe, expect, test } from '@jest/globals';

/**
 * Internal dependencies
 */
import { getAccountCredential, getCalypsoURL, getAccountSiteURL } from '../src/data-helper';

describe( 'DataHelper Tests', function () {
	describe( `Test: getCalypsoURL`, function () {
		test.each`
			route           | queryStrings                               | expected
			${ '/' }        | ${ undefined }                             | ${ 'https://wordpress.com/' }
			${ 'log-in' }   | ${ undefined }                             | ${ 'https://wordpress.com/log-in' }
			${ 'post/new' } | ${ { param: 'test' } }                     | ${ 'https://wordpress.com/post/new?param=test' }
			${ 'post/new' } | ${ { param: 'test', query: 'jest-test' } } | ${ 'https://wordpress.com/post/new?param=test&query=jest-test' }
			${ 'post/new' } | ${ { param: 'ASCIIではありません' } }      | ${ 'https://wordpress.com/post/new?param=ASCII%E3%81%A7%E3%81%AF%E3%81%82%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93' }
		`(
			'Returns $expected if getCalypsoURL is called with $route and $queryStrings',
			function ( { route, queryStrings, expected } ) {
				expect( getCalypsoURL( route, queryStrings ) ).toBe( expected );
			}
		);
	} );

	describe( `Test: getAccountCredential`, function () {
		test.each`
			accountType      | expected
			${ 'basicUser' } | ${ [ 'wpcomuser', 'hunter2' ] }
			${ 'noURLUser' } | ${ [ 'nourluser', 'password1234' ] }
		`(
			'Returns $expected if getAccountCredentials is called with $accountType',
			function ( { accountType, expected } ) {
				expect( getAccountCredential( accountType ) ).toStrictEqual( expected );
			}
		);

		test.each`
			accountType
			${ 'nonexistent_user' }
		`(
			'Throws error if getAccountCredentials is called with $accountType',
			function ( { accountType } ) {
				expect( () => getAccountCredential( accountType ) ).toThrow();
			}
		);
	} );

	describe( `Test: getAccountSiteURL`, function () {
		// test.each`
		// 	accountType      | expected
		// 	${ 'basicUser' } | ${ 'https://wpcomuser.wordpress.com/' }
		// 	${ 'advancedUser' } | ${ 'https://advancedwpcomuser.wordpress.com/' }
		// `(
		// 	'Returns $expected if getAccountSiteURL is called with $accountType',
		// 	function ( { accountType, expected } ) {
		// 		expect( getAccountSiteURL( accountType ) ).toStrictEqual( expected );
		// 	}
		// );

		test.each`
			accountType             | expected
			${ 'nonexistent_user' } | ${ Error }
			${ 'noURLUser' }        | ${ Error }
		`(
			'Throws error if getAccountCredentials is called with $accountType',
			function ( { accountType, expected } ) {
				expect( () => getAccountSiteURL( accountType ) ).toThrow( expected );
			}
		);
	} );
} );
