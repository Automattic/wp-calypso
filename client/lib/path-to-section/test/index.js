/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { wpcomImplementation, fallbackImplementation } from '..';

describe( 'pathToSection', () => {
	describe( 'wpcomImplementation', () => {
		test( 'should assume the Reader as the app root', () => {
			expect( wpcomImplementation( '/' ) ).to.equal( 'reader' );
		} );
		test( 'should handle cases where path and section have different names', () => {
			expect( wpcomImplementation( '/read' ) ).to.equal( 'reader' );
		} );
		test( 'should correctly associate paths that start with the same string', () => {
			expect( wpcomImplementation( '/themes' ) ).to.equal( 'themes' );
			expect( wpcomImplementation( '/theme' ) ).to.equal( 'theme' );
		} );
		test( 'should handle deep paths', () => {
			expect( wpcomImplementation( '/me/account' ) ).to.equal( 'me' );
		} );
	} );

	describe( 'fallbackImplementation', () => {
		test( 'should assume the top of the path is the section', () => {
			expect( fallbackImplementation( '/foo/bar' ) ).to.equal( 'foo' );
		} );
		test( 'should return null if unsuccessful', () => {
			expect( fallbackImplementation( '/' ) ).to.equal( null );
		} );
	} );
} );
