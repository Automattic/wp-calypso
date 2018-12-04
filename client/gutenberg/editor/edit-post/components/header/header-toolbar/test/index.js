/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { editorPathRegex } from '../utils';

describe( 'editorPathRegex', () => {
	test( 'matches editor paths', () => {
		expect( '/gutenberg' ).toMatch( editorPathRegex );
		expect( '/gutenberg/' ).toMatch( editorPathRegex );
		expect( '/gutenberg/page' ).toMatch( editorPathRegex );
		expect( '/gutenberg/page/' ).toMatch( editorPathRegex );
		expect( '/gutenberg/post' ).toMatch( editorPathRegex );
		expect( '/gutenberg/post/' ).toMatch( editorPathRegex );
		expect( '/gutenberg/edit/1' ).toMatch( editorPathRegex );
		expect( '/gutenberg/edit/12' ).toMatch( editorPathRegex );
		expect( '/gutenberg/edit/1/' ).toMatch( editorPathRegex );
		expect( '/gutenberg/edit/12/' ).toMatch( editorPathRegex );
		expect( '/post' ).toMatch( editorPathRegex );
		expect( '/post/' ).toMatch( editorPathRegex );
		expect( '/edit/1' ).toMatch( editorPathRegex );
		expect( '/edit/12' ).toMatch( editorPathRegex );
		expect( '/edit/1/' ).toMatch( editorPathRegex );
		expect( '/edit/12/' ).toMatch( editorPathRegex );
		expect( '/gutenberg/edit/24?pretty=true' ).toMatch( editorPathRegex );
	} );

	test( 'fails to match non-editor paths', () => {
		expect( '/' ).not.toMatch( editorPathRegex );
		expect( '//' ).not.toMatch( editorPathRegex );
		expect( '/gutenberg/edit' ).not.toMatch( editorPathRegex );
		expect( '/gutenberg/edit/' ).not.toMatch( editorPathRegex );
		expect( '/gutenberg/pasta' ).not.toMatch( editorPathRegex );
		expect( '/flowers' ).not.toMatch( editorPathRegex );
		expect( '/editor' ).not.toMatch( editorPathRegex );
		expect( 'gutenberg' ).not.toMatch( editorPathRegex );
		expect( 'gutenberg/post' ).not.toMatch( editorPathRegex );
		expect( '/page?id=18' ).not.toMatch( editorPathRegex );
	} );
} );
