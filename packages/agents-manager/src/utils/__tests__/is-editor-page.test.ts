/**
 * @jest-environment jsdom
 */
import { isEditorPage } from '../is-editor-page';

describe( 'isEditorPage', () => {
	const setBodyClasses = ( classes: string ) => {
		document.body.className = classes;
	};

	afterEach( () => {
		document.body.className = '';
	} );

	it( 'returns `true` for the site editor', () => {
		setBodyClasses( 'wp-admin site-editor-php' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for editing a post', () => {
		setBodyClasses( 'wp-admin post-php post-type-post' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for creating a new post', () => {
		setBodyClasses( 'wp-admin post-new-php post-type-post' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for editing a page', () => {
		setBodyClasses( 'wp-admin post-php post-type-page' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for creating a new page', () => {
		setBodyClasses( 'wp-admin post-new-php post-type-page' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `false` when editing a custom post type', () => {
		setBodyClasses( 'wp-admin post-php post-type-product' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` when creating a custom post type', () => {
		setBodyClasses( 'wp-admin post-new-php post-type-product' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` for the post list screen (editor screen class absent)', () => {
		setBodyClasses( 'wp-admin edit-php post-type-post' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` for other admin pages', () => {
		setBodyClasses( 'wp-admin index-php' );
		expect( isEditorPage() ).toBe( false );
	} );
} );
