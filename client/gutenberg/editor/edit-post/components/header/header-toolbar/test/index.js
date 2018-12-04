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
		expect( '/block-editor' ).toMatch( editorPathRegex );
		expect( '/block-editor/' ).toMatch( editorPathRegex );
		expect( '/block-editor/page' ).toMatch( editorPathRegex );
		expect( '/block-editor/page/' ).toMatch( editorPathRegex );
		expect( '/block-editor/post' ).toMatch( editorPathRegex );
		expect( '/block-editor/post/' ).toMatch( editorPathRegex );
		expect( '/block-editor/post/pasta' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/1' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/12' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/1/' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/12/' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/12/34' ).toMatch( editorPathRegex );
		expect( '/post' ).toMatch( editorPathRegex );
		expect( '/post/' ).toMatch( editorPathRegex );
		expect( '/edit/1' ).toMatch( editorPathRegex );
		expect( '/edit/12' ).toMatch( editorPathRegex );
		expect( '/edit/1/' ).toMatch( editorPathRegex );
		expect( '/edit/12/' ).toMatch( editorPathRegex );
		expect( '/block-editor/edit/24?pretty=true' ).toMatch( editorPathRegex );
	} );

	test( 'fails to match non-editor paths', () => {
		expect( '/' ).not.toMatch( editorPathRegex );
		expect( '//' ).not.toMatch( editorPathRegex );
		expect( '/block-editor/edit' ).not.toMatch( editorPathRegex );
		expect( '/block-editor/edit/' ).not.toMatch( editorPathRegex );
		expect( '/block-editor/pasta' ).not.toMatch( editorPathRegex );
		expect( '/flowers' ).not.toMatch( editorPathRegex );
		expect( '/editor' ).not.toMatch( editorPathRegex );
		expect( 'block-editor' ).not.toMatch( editorPathRegex );
		expect( 'block-editor/post' ).not.toMatch( editorPathRegex );
		expect( '/page?id=18' ).not.toMatch( editorPathRegex );
	} );
} );
