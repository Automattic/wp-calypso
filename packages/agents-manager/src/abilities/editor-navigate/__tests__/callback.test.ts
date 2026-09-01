/**
 * @jest-environment jsdom
 */
import { dispatch, select, subscribe } from '@wordpress/data';
import { getEditorHistory } from '../../../utils/editor-history';
import { isEditorPage } from '../../../utils/is-editor-page';
import { editorNavigate, editorNavigateCallback } from '../callback';
import type { EditorNavigateIO } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn( () => undefined ),
	dispatch: jest.fn( () => undefined ),
	resolveSelect: jest.fn( () => undefined ),
	subscribe: jest.fn( () => () => {} ),
} ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn( () => true ) } ) );
jest.mock( '../../../utils/editor-history', () => ( { getEditorHistory: jest.fn() } ) );

const navigate = jest.fn().mockResolvedValue( undefined );

function createIO( overrides: Partial< EditorNavigateIO > = {} ) {
	return {
		saveEverything: jest.fn().mockResolvedValue( undefined ),
		getHistory: jest.fn().mockReturnValue( { navigate } ),
		waitForPage: jest.fn().mockResolvedValue( true ),
		closeCommandPalette: jest.fn(),
		getPostContentClientId: jest.fn().mockReturnValue( 'departing-block' ),
		getLoadedPageId: jest.fn().mockReturnValue( 456 ),
		restorePostContentEditing: jest.fn().mockResolvedValue( undefined ),
		refreshNavigationBlocks: jest.fn().mockResolvedValue( 2 ),
		navigateWholePage: jest.fn(),
		...overrides,
	} as jest.Mocked< EditorNavigateIO >;
}

beforeEach( () => {
	jest.clearAllMocks();
	// The flow reads the URL for `wp_theme_preview`, so tests must not inherit
	// one another's location.
	window.history.replaceState( {}, '', '/wp-admin/site-editor.php' );
} );

describe( 'editorNavigate', () => {
	it( 'saves, navigates, and reports the arrival once the editor has the page', async () => {
		const io = createIO();

		const result = await editorNavigate( io, { path: '/page/123' } );

		expect( io.saveEverything ).toHaveBeenCalled();
		expect( navigate ).toHaveBeenCalledWith( '/page/123?canvas=edit' );
		expect( io.waitForPage ).toHaveBeenCalledWith( 123 );
		// Restored against the block being left, so the wait cannot settle on
		// the departing page's tree.
		expect( io.restorePostContentEditing ).toHaveBeenCalledWith( 'departing-block' );
		expect( io.closeCommandPalette ).toHaveBeenCalled();
		expect( result.result.error ).toBeUndefined();
		expect( result ).toMatchObject( {
			result: { success: true, details: { path: '/page/123', refreshedNavigationBlocks: 0 } },
			returnToAgent: true,
		} );
	} );

	it( 'skips the post-content restore when the page is already open', async () => {
		const io = createIO( { getLoadedPageId: jest.fn().mockReturnValue( 123 ) } );

		const result = await editorNavigate( io, { path: '/page/123' } );

		expect( navigate ).toHaveBeenCalledWith( '/page/123?canvas=edit' );
		// Nothing switched, so waiting for a replacement block would only
		// stall the reply until the timeout.
		expect( io.restorePostContentEditing ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
	} );

	it( 'still restores when the editor was holding a non-page of the same id', async () => {
		// Ids repeat across post types, so "already open" means the page, not
		// whatever else happens to carry that number.
		const io = createIO( { getLoadedPageId: jest.fn().mockReturnValue( undefined ) } );

		await editorNavigate( io, { path: '/page/123' } );

		expect( io.restorePostContentEditing ).toHaveBeenCalledWith( 'departing-block' );
	} );

	it( 'carries wp_theme_preview through, so navigating stays in the preview', async () => {
		window.history.replaceState(
			{},
			'',
			'/wp-admin/site-editor.php?wp_theme_preview=twentytwentyfive'
		);

		await editorNavigate( createIO(), { path: '/page/123' } );

		expect( navigate ).toHaveBeenCalledWith(
			'/page/123?canvas=edit&wp_theme_preview=twentytwentyfive'
		);
	} );

	it( 'carries wp_theme_preview through the full-page fallback too', async () => {
		window.history.replaceState( {}, '', '/wp-admin/post.php?wp_theme_preview=twentytwentyfive' );
		const io = createIO( { getHistory: jest.fn().mockReturnValue( undefined ) } );

		await editorNavigate( io, { path: '/page/123' } );

		expect( io.navigateWholePage ).toHaveBeenCalledWith(
			'/wp-admin/site-editor.php?p=%2Fpage%2F123&canvas=edit&wp_theme_preview=twentytwentyfive'
		);
	} );

	it( 'saves before navigating, so pending edits are not lost', async () => {
		const order: string[] = [];
		const io = createIO( {
			saveEverything: jest.fn( async () => {
				order.push( 'save' );
			} ),
			getHistory: jest
				.fn()
				.mockReturnValue( { navigate: jest.fn( async () => void order.push( 'navigate' ) ) } ),
		} );

		await editorNavigate( io, { path: '/page/123' } );

		expect( order ).toEqual( [ 'save', 'navigate' ] );
	} );

	it( 'opens the pages list for all-pages, with no page to wait for', async () => {
		const io = createIO();

		const result = await editorNavigate( io, { path: 'all-pages' } );

		// A route with no canvas and no post entity behind it.
		expect( navigate ).toHaveBeenCalledWith( '/page' );
		expect( io.waitForPage ).not.toHaveBeenCalled();
		expect( io.restorePostContentEditing ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
	} );

	it.each( [
		[ 'a slug', '/page/about' ],
		[ 'a full URL', 'https://example.com/page/12' ],
		[ 'an unrelated route', '/visit' ],
		// `Number` would rewrite these, but the canvas guard binds the raw
		// text — so they must not be accepted at all.
		[ 'a leading-zero id', '/page/00123' ],
		[ 'an id past MAX_SAFE_INTEGER', '/page/90071992547409911' ],
		[ 'a missing path', undefined ],
	] )( 'refuses %s without saving or navigating', async ( _case, path ) => {
		const io = createIO();

		const result = await editorNavigate( io, { path } );

		expect( result.result.success ).toBe( false );
		expect( io.saveEverything ).not.toHaveBeenCalled();
		expect( io.navigateWholePage ).not.toHaveBeenCalled();
	} );

	it( 'refuses to report success when the editor never loads the page', async () => {
		const io = createIO( { waitForPage: jest.fn().mockResolvedValue( false ) } );

		const result = await editorNavigate( io, { path: '/page/7' } );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'did not finish loading' );
		// The backend echoes `message` to the user, so the agent instruction
		// must stay in `error` — the raw-text bug this split fixed.
		expect( result.result.message ).toBe( 'That page did not finish opening.' );
		// The agent must not edit a page the editor may not be showing.
		expect( io.restorePostContentEditing ).not.toHaveBeenCalled();
		expect( io.refreshNavigationBlocks ).not.toHaveBeenCalled();
	} );

	it( 'falls back to a whole-page load when there is no router', async () => {
		const io = createIO( { getHistory: jest.fn().mockReturnValue( undefined ) } );

		const result = await editorNavigate( io, { path: '/page/9' } );

		expect( io.saveEverything ).toHaveBeenCalled();
		expect( io.navigateWholePage ).toHaveBeenCalledWith(
			'/wp-admin/site-editor.php?p=%2Fpage%2F9&canvas=edit'
		);
		expect( result.result.details ).toMatchObject( { path: '/page/9', fullPageLoad: true } );
		// The backend acks this tool from the envelope, so the result must be
		// delivered — the navigation waits for the stream to close.
		expect( result.returnToAgent ).toBe( true );
		expect( io.waitForPage ).not.toHaveBeenCalled();
	} );

	it( 'keeps a whole-page load inside a subdirectory install', async () => {
		window.history.replaceState( {}, '', '/wordpress/wp-admin/post.php?post=9&action=edit' );
		const io = createIO( { getHistory: jest.fn().mockReturnValue( undefined ) } );

		await editorNavigate( io, { path: '/page/9' } );

		expect( io.navigateWholePage ).toHaveBeenCalledWith(
			'/wordpress/wp-admin/site-editor.php?p=%2Fpage%2F9&canvas=edit'
		);
	} );

	it( 'omits the canvas from a whole-page load of the pages list', async () => {
		const io = createIO( { getHistory: jest.fn().mockReturnValue( undefined ) } );

		await editorNavigate( io, { path: 'all-pages' } );

		expect( io.navigateWholePage ).toHaveBeenCalledWith( '/wp-admin/site-editor.php?p=%2Fpage' );
	} );

	it.each( [ 'page/123', '/page/123', '/page/123/' ] )(
		'normalizes %s to the canonical path',
		async ( path ) => {
			const io = createIO();

			const result = await editorNavigate( io, { path } );

			expect( navigate ).toHaveBeenCalledWith( '/page/123?canvas=edit' );
			expect( result.result.details ).toMatchObject( { path: '/page/123' } );
		}
	);

	it( 'refreshes navigation blocks only when asked, and reports how many', async () => {
		const io = createIO();

		const withRefresh = await editorNavigate( io, {
			path: '/page/123',
			refresh_navigation: true,
		} );

		expect( io.refreshNavigationBlocks ).toHaveBeenCalled();
		expect( withRefresh.result.details ).toMatchObject( {
			refreshNavigation: true,
			refreshedNavigationBlocks: 2,
		} );
	} );

	it( 'prefers the agent’s own summary as the message', async () => {
		const io = createIO();

		const result = await editorNavigate( io, {
			path: '/page/5',
			summary: 'Opened the About page.',
		} );

		expect( result.result.message ).toBe( 'Opened the About page.' );
	} );

	it( 'reports a failed save as an error instead of claiming arrival', async () => {
		const io = createIO( {
			saveEverything: jest.fn().mockRejectedValue( new Error( 'save failed' ) ),
		} );

		const result = await editorNavigate( io, { path: '/page/3' } );

		expect( navigate ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'save failed' );
		// Not "I could not open that page" — the edits are the thing at risk.
		expect( result.result.message ).toContain( 'could not save' );
	} );

	it( 'names the pages list, not “that page”, when the list fails to open', async () => {
		const io = createIO( {
			getHistory: jest
				.fn()
				.mockReturnValue( { navigate: jest.fn().mockRejectedValue( new Error( 'boom' ) ) } ),
		} );

		const result = await editorNavigate( io, { path: 'all-pages' } );

		expect( result.result.message ).toBe( 'I could not open the pages list.' );
	} );
} );

describe( 'editorNavigateCallback', () => {
	it.each( [
		{ sent: 'false', refreshes: false },
		{ sent: 'true', refreshes: false },
		{ sent: true, refreshes: true },
	] )( 'treats refresh_navigation $sent as $refreshes', async ( { sent, refreshes } ) => {
		const io = createIO();

		const result = await editorNavigate( io, {
			path: '/page/123',
			refresh_navigation: sent as boolean,
		} );

		expect( io.refreshNavigationBlocks ).toHaveBeenCalledTimes( refreshes ? 1 : 0 );
		expect( result.result.details ).toMatchObject( { refreshNavigation: refreshes } );
	} );

	it( 'ignores a summary that is not a string, which `message` must be', async () => {
		const result = await editorNavigate( createIO(), {
			path: '/page/123',
			summary: 12 as unknown as string,
		} );

		expect( typeof result.result.message ).toBe( 'string' );
		expect( result.result.message ).toContain( '/page/123' );
	} );

	it( 'refuses to navigate when the editor is not open', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );

		const result = await editorNavigateCallback( { path: '/page/123' } );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'editor is not open' );
	} );

	// Every other test injects the IO, so this is the only cover for the
	// wiring itself: the stores each step actually reads and writes.
	it( 'saves, routes, and re-enables the destination through the real stores', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( true );

		const navigate = jest.fn().mockResolvedValue( undefined );
		const saveEditedEntityRecord = jest.fn().mockResolvedValue( undefined );
		const editEntityRecord = jest.fn();
		const setBlockEditingMode = jest.fn();
		const closeCommandPalette = jest.fn();
		const listeners: ( () => void )[] = [];

		let currentPostId = 456;
		let postContentClientId = 'departing-block';

		( getEditorHistory as jest.Mock ).mockReturnValue( { navigate } );
		( subscribe as jest.Mock ).mockImplementation( ( listener: () => void ) => {
			listeners.push( listener );
			return () => {};
		} );
		( select as jest.Mock ).mockImplementation( ( store: string ) => {
			switch ( store ) {
				case 'core':
					return {
						__experimentalGetDirtyEntityRecords: () => [
							{ kind: 'postType', name: 'page', key: 456 },
							{ kind: 'postType', name: 'wp_navigation', key: 7 },
						],
					};
				case 'core/editor':
					return {
						getCurrentPostId: () => currentPostId,
						getCurrentPostType: () => 'page',
					};
				case 'core/block-editor':
					return {
						getBlocksByName: ( name: string ) =>
							name === 'core/post-content' ? [ postContentClientId ] : [],
						getBlockEditingMode: () => 'contentOnly',
					};
			}
		} );
		( dispatch as jest.Mock ).mockImplementation( ( store: string ) => {
			switch ( store ) {
				case 'core':
					return { editEntityRecord, saveEditedEntityRecord };
				case 'core/commands':
					return { close: closeCommandPalette };
				case 'core/block-editor':
					return {
						setBlockEditingMode,
						__unstableMarkNextChangeAsNotPersistent: jest.fn(),
					};
			}
		} );

		const pending = editorNavigateCallback( { path: '/page/123' } );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		// The editor settles on the destination, which brings its own block.
		currentPostId = 123;
		postContentClientId = 'arriving-block';
		listeners.forEach( ( listener ) => listener() );

		const result = await pending;

		expect( saveEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 456, {
			throwOnError: true,
		} );
		// Menus follow core's save, which publishes them instead of leaving a
		// menu built this turn as a draft.
		expect( editEntityRecord ).toHaveBeenCalledWith( 'postType', 'wp_navigation', 7, {
			status: 'publish',
		} );
		expect( editEntityRecord ).toHaveBeenCalledTimes( 1 );
		expect( navigate ).toHaveBeenCalledWith( '/page/123?canvas=edit' );
		expect( closeCommandPalette ).toHaveBeenCalled();
		expect( setBlockEditingMode ).toHaveBeenCalledWith( 'arriving-block', 'default' );
		expect( result.result.success ).toBe( true );
	} );
} );
