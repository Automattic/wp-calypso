/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { newPage, newPost, publicizeConnections } from '../index';

/**
 * Module variables
 */
const DUMMY_SITE = {
	ID: 73693298,
	slug: 'settingstestsite.wordpress.com',
};

describe( 'index', () => {
	describe( '#newPost()', () => {
		test( 'should return the Calypso root post path no site', () => {
			expect( newPost() ).to.equal( '/post' );
		} );

		test( 'should return a Calypso site-prefixed post path if site exists', () => {
			expect( newPost( DUMMY_SITE ) ).to.equal( '/post/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#newPage()', () => {
		test( 'should return the Calypso root page path no site', () => {
			expect( newPage() ).to.equal( '/page' );
		} );

		test( 'should return a Calypso site-prefixed page path if site exists', () => {
			expect( newPage( DUMMY_SITE ) ).to.equal( '/page/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#publicizeConnections()', () => {
		test( 'should return the root sharing path if no site specified', () => {
			expect( publicizeConnections() ).to.equal( '/marketing/connections' );
		} );

		test( 'should return a Calypso site-suffixed sharing path if site specified', () => {
			expect( publicizeConnections( DUMMY_SITE ) ).to.equal(
				'/marketing/connections/' + DUMMY_SITE.slug
			);
		} );
	} );
} );
