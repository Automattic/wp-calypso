/**
 * Internal dependencies
 */
import { newPost } from '../index';

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
			expect( newPost() ).toBe( '/post' );
		} );

		test( 'should return a Calypso site-prefixed post path if site exists', () => {
			expect( newPost( DUMMY_SITE ) ).toBe( '/post/' + DUMMY_SITE.slug );
		} );
	} );
} );
