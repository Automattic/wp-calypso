/**
 * External dependencies
 */
import { describe, expect, test } from '@jest/globals';

/**
 * Internal dependencies
 */
import {
	getAccountCredential,
	getCalypsoURL,
	getAccountSiteURL,
	toTitleCase,
	createSuiteTitle,
} from '../src/data-helper';

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
			'Returns $expected if getAccountCredential is called with $accountType',
			function ( { accountType, expected } ) {
				expect( getAccountCredential( accountType ) ).toStrictEqual( expected );
			}
		);

		test.each`
			accountType
			${ 'nonexistent_user' }
		`(
			'Throws error if getAccountCredential is called with $accountType',
			function ( { accountType } ) {
				expect( () => getAccountCredential( accountType ) ).toThrow();
			}
		);
	} );

	describe( `Test: getAccountSiteURL`, function () {
		test.each`
			accountType         | expected
			${ 'basicUser' }    | ${ 'https://wpcomuser.wordpress.com/' }
			${ 'advancedUser' } | ${ 'https://advancedwpcomuser.wordpress.com/' }
		`(
			'Returns $expected if getAccountSiteURL is called with $accountType',
			function ( { accountType, expected } ) {
				expect( getAccountSiteURL( accountType ) ).toStrictEqual( expected );
			}
		);

		test.each`
			accountType             | expected
			${ 'nonexistent_user' } | ${ Error }
			${ 'noURLUser' }        | ${ ReferenceError }
		`(
			'Throws error if getAccountSiteURL is called with $accountType',
			function ( { accountType, expected } ) {
				expect( () => getAccountSiteURL( accountType ) ).toThrow( expected );
			}
		);
	} );

	describe( `Test: toTitleCase`, function () {
		test.each`
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

	describe( `Test: createSuiteTitle`, function () {
		test.each`
			suite                       | viewport       | expected
			${ 'Feature (Click: Tap)' } | ${ 'desktop' } | ${ '[WPCOM] Feature (Click: Tap): (desktop) @parallel' }
			${ 'Manage' }               | ${ 'mobile' }  | ${ '[WPCOM] Manage: (mobile) @parallel' }
		`(
			'Returns $expected if toTitleCase is called with $words',
			function ( { suite, viewport, expected } ) {
				process.env.VIEWPORT_NAME = viewport;
				expect( createSuiteTitle( suite ) ).toStrictEqual( expected );
			}
		);
	} );
} );
