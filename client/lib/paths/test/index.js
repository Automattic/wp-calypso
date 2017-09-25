/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import paths from '../';

/**
 * Module variables
 */
const DUMMY_SITE = {
	ID: 73693298,
	slug: 'settingstestsite.wordpress.com'
};

describe( 'index', function() {
	describe( '#newPost()', function() {
		it( 'should return the Calypso root post path no site', function() {
			const url = paths.newPost();

			expect( url ).to.equal( '/post' );
		} );

		it( 'should return a Calypso site-prefixed post path if site exists', function() {
			const url = paths.newPost( DUMMY_SITE );

			expect( url ).to.equal( '/post/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#newPage()', function() {
		it( 'should return the Calypso root page path no site', function() {
			const url = paths.newPage();

			expect( url ).to.equal( '/page' );
		} );

		it( 'should return a Calypso site-prefixed page path if site exists', function() {
			const url = paths.newPage( DUMMY_SITE );

			expect( url ).to.equal( '/page/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#publicizeConnections()', function() {
		it( 'should return the root sharing path if no site specified', function() {
			const url = paths.publicizeConnections();

			expect( url ).to.equal( '/sharing' );
		} );

		it( 'should return a Calypso site-suffixed sharing path if site specified', function() {
			const url = paths.publicizeConnections( DUMMY_SITE );

			expect( url ).to.equal( '/sharing/' + DUMMY_SITE.slug );
		} );
	} );
} );
