import { isEditorPage } from '../is-editor-page';

describe( 'isEditorPage', () => {
	const originalWindow = global.window;

	const mockLocation = ( path: string ) => {
		const url = new URL( `https://wordpress.com${ path }` );

		global.window = {
			location: { href: url.href, search: url.search },
		} as Window & typeof globalThis;
	};

	beforeEach( () => {
		// @ts-expect-error - Mocking window
		delete global.window;
	} );

	afterEach( () => {
		global.window = originalWindow;
	} );

	it( 'returns `false` when `window` is undefined (SSR)', () => {
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `true` for site editor URL', () => {
		mockLocation( '/wp-admin/site-editor.php?canvas=edit' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for site editor URL without query params', () => {
		mockLocation( '/wp-admin/site-editor.php' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for editing a post', () => {
		mockLocation( '/wp-admin/post.php?post=4&action=edit' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for creating a new post', () => {
		mockLocation( '/wp-admin/post-new.php' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for creating a new post with explicit post_type', () => {
		mockLocation( '/wp-admin/post-new.php?post_type=post' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for creating a new page', () => {
		mockLocation( '/wp-admin/post-new.php?post_type=page' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `true` for editing a page', () => {
		mockLocation( '/wp-admin/post.php?post=10&action=edit&post_type=page' );
		expect( isEditorPage() ).toBe( true );
	} );

	it( 'returns `false` for custom post type', () => {
		mockLocation( '/wp-admin/post-new.php?post_type=product' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` for editing a custom post type', () => {
		mockLocation( '/wp-admin/post.php?post=5&action=edit&post_type=product' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` for non-editor admin pages', () => {
		mockLocation( '/wp-admin/index.php' );
		expect( isEditorPage() ).toBe( false );
	} );

	it( 'returns `false` for frontend pages', () => {
		mockLocation( '/my-blog-post' );
		expect( isEditorPage() ).toBe( false );
	} );
} );
