/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	paths = require( '../' );

/**
 * Module variables
 */
var DUMMY_SITE = {
	ID: 73693298,
	slug: 'settingstestsite.wordpress.com'
};

describe( 'paths', function() {
	var sandbox;

	before( function() {
		sandbox = sinon.sandbox.create();
	} );

	beforeEach( function() {
		sandbox.restore();
	} );

	function stubPostEditorFeatureEnabled( isEnabled ) {
		sandbox.stub( config, 'isEnabled', function( feature ) {
			if ( 'post-editor' === feature ) {
				return isEnabled;
			}
		} );
	}

	describe( '#newPost()', function() {
		it( 'should return the live root post path if no site and feature disabled', function() {
			var url;
			stubPostEditorFeatureEnabled( false );

			url = paths.newPost();

			expect( url ).to.equal( '//wordpress.com/post' );
		} );

		it( 'should return a live site-prefixed post path if site exists, but feature disabled', function() {
			var url;
			stubPostEditorFeatureEnabled( false );

			url = paths.newPost( DUMMY_SITE );

			expect( url ).to.equal( '//wordpress.com/post/' + DUMMY_SITE.ID + '/new' );
		} );

		it( 'should return the Calypso root post path no site and featured enabled', function() {
			var url;
			stubPostEditorFeatureEnabled( true );

			url = paths.newPost();

			expect( url ).to.equal( '/post' );
		} );

		it( 'should return a Calypso site-prefixed post path if site exists and featured enabled', function() {
			var url;
			stubPostEditorFeatureEnabled( true );

			url = paths.newPost( DUMMY_SITE );

			expect( url ).to.equal( '/post/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#newPage()', function() {
		it( 'should return the live root page path if no site and feature disabled', function() {
			var url;
			stubPostEditorFeatureEnabled( false );

			url = paths.newPage();

			expect( url ).to.equal( '//wordpress.com/page' );
		} );

		it( 'should return a live site-prefixed page path if site exists, but feature disabled', function() {
			var url;
			stubPostEditorFeatureEnabled( false );

			url = paths.newPage( DUMMY_SITE );

			expect( url ).to.equal( '//wordpress.com/page/' + DUMMY_SITE.ID + '/new' );
		} );

		it( 'should return the Calypso root page path no site and featured enabled', function() {
			var url;
			stubPostEditorFeatureEnabled( true );

			url = paths.newPage();

			expect( url ).to.equal( '/page' );
		} );

		it( 'should return a Calypso site-prefixed page path if site exists and featured enabled', function() {
			var url;
			stubPostEditorFeatureEnabled( true );

			url = paths.newPage( DUMMY_SITE );

			expect( url ).to.equal( '/page/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#publicizeConnections()', function() {
		it( 'should return the root sharing path if no site specified', function() {
			var url = paths.publicizeConnections();

			expect( url ).to.equal( '/sharing' );
		} );

		it( 'should return a Calypso site-suffixed sharing path if site specified', function() {
			var url = paths.publicizeConnections( DUMMY_SITE );

			expect( url ).to.equal( '/sharing/' + DUMMY_SITE.slug );
		} );
	} );
} );
