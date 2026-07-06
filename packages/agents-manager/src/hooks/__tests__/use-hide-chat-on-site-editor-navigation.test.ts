/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useHideChatOnSiteEditorNavigation, {
	useIsSiteEditorNavigation,
} from '../use-hide-chat-on-site-editor-navigation';

// The hook imports a couple of constants from these modules, whose real
// implementations pull in a heavy dependency graph (stores, data-stores, …).
// Mock them down to the constants so this stays a lightweight unit test.
jest.mock( '../use-admin-bar-integration', () => ( {
	ADMIN_BAR_BUTTON_ID: 'wp-admin-bar-agents-manager',
	ADMIN_BAR_AI_CHAT_BUTTON_ID: 'wp-admin-bar-agents-manager-ai-chat',
} ) );
jest.mock( '../use-agent-layout-manager', () => ( {
	SIDEBAR_CONTAINER_CLASS: 'agents-manager-sidebar-container',
	SIDEBAR_OPEN_CLASS: 'agents-manager-sidebar-container--sidebar-open',
} ) );

const setUrl = ( path: string ) => window.history.replaceState( {}, '', path );

// `replaceState` is patched to notify subscribers, so wrap the reset in `act()`
// to flush any hook still mounted during teardown.
const resetUrl = () => act( () => setUrl( '/' ) );

describe( 'useIsSiteEditorNavigation', () => {
	afterEach( resetUrl );

	it.each( [
		{ view: 'a non-Site-Editor page', url: '/wp-admin/index.php', expected: false },
		{
			view: 'a non-Site-Editor page with `canvas=edit`',
			url: '/wp-admin/post.php?canvas=edit',
			expected: false,
		},
		{ view: 'the Site Editor navigation view', url: '/wp-admin/site-editor.php', expected: true },
		{
			view: 'the Site Editor editing canvas',
			url: '/wp-admin/site-editor.php?canvas=edit',
			expected: false,
		},
	] )( 'is $expected on $view', ( { url, expected } ) => {
		setUrl( url );
		const { result } = renderHook( () => useIsSiteEditorNavigation() );
		expect( result.current ).toBe( expected );
	} );

	it( 'reacts to client-side navigation into and out of the canvas', () => {
		setUrl( '/wp-admin/site-editor.php' );
		const { result } = renderHook( () => useIsSiteEditorNavigation() );
		expect( result.current ).toBe( true );

		act( () => window.history.pushState( {}, '', '/wp-admin/site-editor.php?canvas=edit' ) );
		expect( result.current ).toBe( false );

		act( () => window.history.pushState( {}, '', '/wp-admin/site-editor.php' ) );
		expect( result.current ).toBe( true );
	} );
} );

describe( 'useHideChatOnSiteEditorNavigation', () => {
	// The two top-level admin-bar entry points the hook targets.
	const ENTRY_POINT_IDS = [ 'wp-admin-bar-agents-manager', 'wp-admin-bar-agents-manager-ai-chat' ];
	const SIDEBAR_CLASSES = [
		'agents-manager-sidebar-container',
		'agents-manager-sidebar-container--sidebar-open',
	];

	// Recreate the server-rendered admin-bar entry points and docked-sidebar body
	// classes the hook acts on.
	const setUpChatSurfaces = () => {
		ENTRY_POINT_IDS.forEach( ( id ) => {
			const entry = document.createElement( 'li' );
			entry.id = id;
			document.body.appendChild( entry );
		} );
		document.body.classList.add( ...SIDEBAR_CLASSES );
	};

	afterEach( () => {
		resetUrl();
		document.body.className = '';
		ENTRY_POINT_IDS.forEach( ( id ) => document.getElementById( id )?.remove() );
	} );

	it.each( [
		{
			description:
				'hides the entry points and strips the docked-sidebar classes on the navigation view',
			url: '/wp-admin/site-editor.php',
			hidden: true,
		},
		{
			description: 'leaves the entry points and classes untouched in the editing canvas',
			url: '/wp-admin/site-editor.php?canvas=edit',
			hidden: false,
		},
	] )( '$description', ( { url, hidden } ) => {
		setUpChatSurfaces();
		setUrl( url );

		renderHook( () => useHideChatOnSiteEditorNavigation() );

		ENTRY_POINT_IDS.forEach( ( id ) =>
			expect( document.getElementById( id )?.style.display ).toBe( hidden ? 'none' : '' )
		);
		SIDEBAR_CLASSES.forEach( ( cls ) =>
			expect( document.body.classList.contains( cls ) ).toBe( ! hidden )
		);
	} );

	it( 'restores the entry points and classes when navigating from the navigation view to the canvas', () => {
		setUpChatSurfaces();
		setUrl( '/wp-admin/site-editor.php' );
		renderHook( () => useHideChatOnSiteEditorNavigation() );

		act( () => window.history.pushState( {}, '', '/wp-admin/site-editor.php?canvas=edit' ) );

		ENTRY_POINT_IDS.forEach( ( id ) =>
			expect( document.getElementById( id )?.style.display ).toBe( '' )
		);
		SIDEBAR_CLASSES.forEach( ( cls ) =>
			expect( document.body.classList.contains( cls ) ).toBe( true )
		);
	} );
} );
