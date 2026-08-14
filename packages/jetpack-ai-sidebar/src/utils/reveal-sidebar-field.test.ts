/**
 * @jest-environment jsdom
 */

const mockClearSelectedBlock = jest.fn();
const mockEnableComplementaryArea = jest.fn();
let mockOpenPanels: string[] = [];
let mockRemovedPanels: string[] = [];

// Mirrors core's toggle so tests can assert the preference the user is left
// with, rather than how many times it was written.
const mockToggleEditorPanelOpened = jest.fn( ( panelName: string ) => {
	mockOpenPanels = mockOpenPanels.includes( panelName )
		? mockOpenPanels.filter( ( name ) => name !== panelName )
		: [ ...mockOpenPanels, panelName ];
} );

let mockStoresRegistered = true;

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( ( store: string ) => {
		if ( ! mockStoresRegistered ) {
			return {};
		}
		if ( store === 'core/block-editor' ) {
			return { clearSelectedBlock: mockClearSelectedBlock };
		}
		if ( store === 'core/interface' ) {
			return { enableComplementaryArea: mockEnableComplementaryArea };
		}
		if ( store === 'core/editor' ) {
			return { toggleEditorPanelOpened: mockToggleEditorPanelOpened };
		}
		return {};
	} ),
	select: jest.fn( ( store: string ) => {
		if ( store === 'core/editor' ) {
			return {
				isEditorPanelOpened: ( panelName: string ) => mockOpenPanels.includes( panelName ),
				isEditorPanelRemoved: ( panelName: string ) => mockRemovedPanels.includes( panelName ),
			};
		}
		return {};
	} ),
} ) );

import { revealSidebarField } from './reveal-sidebar-field';

function renderSidebar( innerHTML: string ) {
	const sidebar = document.createElement( 'div' );
	sidebar.id = 'edit-post:document';
	sidebar.innerHTML = innerHTML;
	document.body.appendChild( sidebar );
	return sidebar;
}

/**
 * Renders the excerpt field inside the document sidebar, mirroring the editor's
 * layout of excerpt text beside the edit button. The field is focusable so a
 * stray focus call would move `document.activeElement`; jsdom does not
 * implement scrollIntoView, so that one is stubbed to make the call observable.
 */
function renderField() {
	const sidebar = renderSidebar(
		'<div class="excerpt-row"><p>New excerpt</p><div class="editor-post-excerpt__dropdown" tabindex="-1"></div></div>'
	);
	const field = sidebar.querySelector< HTMLElement >( '.editor-post-excerpt__dropdown' )!;
	field.scrollIntoView = jest.fn();
	return field;
}

describe( 'revealSidebarField', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		document.body.innerHTML = '';
		mockOpenPanels = [];
		mockRemovedPanels = [];
		mockStoresRegistered = true;
	} );

	it( 'does not write preferences for panels the editor has removed', async () => {
		// Jetpack removes the core excerpt panel when it supplies its own.
		mockRemovedPanels = [ 'post-excerpt' ];
		renderField();

		await revealSidebarField( 'excerpt' );

		expect( mockToggleEditorPanelOpened ).not.toHaveBeenCalledWith( 'post-excerpt' );
	} );

	it( 'returns false for an unknown field without touching the editor', async () => {
		const revealed = await revealSidebarField( 'not-a-field' );

		expect( revealed ).toBe( false );
		expect( mockEnableComplementaryArea ).not.toHaveBeenCalled();
		expect( mockClearSelectedBlock ).not.toHaveBeenCalled();
	} );

	it( "prefers Jetpack's excerpt panel over the core excerpt dropdown", async () => {
		// Core's dropdown comes first in the DOM, so a pass here proves the
		// variant order decided it rather than document order.
		const sidebar = renderSidebar(
			'<div class="editor-post-excerpt__dropdown"></div><div class="jetpack-ai-post-excerpt"></div>'
		);
		const core = sidebar.querySelector< HTMLElement >( '.editor-post-excerpt__dropdown' )!;
		const jetpack = sidebar.querySelector< HTMLElement >( '.jetpack-ai-post-excerpt' )!;
		core.scrollIntoView = jest.fn();
		jetpack.scrollIntoView = jest.fn();

		await revealSidebarField( 'excerpt' );

		expect( jetpack.scrollIntoView ).toHaveBeenCalled();
		expect( core.scrollIntoView ).not.toHaveBeenCalled();
		// The matched variant's panel stays open; `post-excerpt` was opened only
		// to look inside it, so it closes again.
		expect( mockOpenPanels ).toEqual( [ 'jetpack-ai-content-lens/ai-content-lens-plugin' ] );
	} );

	it( 'stops polling at the timeout and puts panel preferences back', async () => {
		mockOpenPanels = [ 'post-status' ];
		renderSidebar( '' );

		await expect( revealSidebarField( 'excerpt', { timeout: 50 } ) ).resolves.toBe( false );
		expect( mockOpenPanels ).toEqual( [ 'post-status' ] );
	} );

	it( 'clears the block selection so the document settings own the sidebar slot', async () => {
		renderField();

		await revealSidebarField( 'excerpt' );

		expect( mockClearSelectedBlock ).toHaveBeenCalled();
	} );

	// Contract with @wordpress/interface. No test can catch Gutenberg renaming these.
	it( 'opens the document sidebar in the core scope', async () => {
		renderField();

		await revealSidebarField( 'excerpt' );

		expect( mockEnableComplementaryArea ).toHaveBeenCalledWith( 'core', 'edit-post/document' );
	} );

	it( 'finds a field the editor renders a frame or two late', async () => {
		const sidebar = renderSidebar( '' );
		const field = document.createElement( 'div' );
		field.className = 'editor-post-excerpt__dropdown';
		field.scrollIntoView = jest.fn();

		const revealing = revealSidebarField( 'excerpt', { timeout: 500 } );
		requestAnimationFrame( () => requestAnimationFrame( () => sidebar.appendChild( field ) ) );

		await expect( revealing ).resolves.toBe( true );
		expect( field.scrollIntoView ).toHaveBeenCalled();
	} );

	it( 'ignores a matching element outside the document sidebar', async () => {
		document.body.innerHTML = '<div class="editor-post-excerpt__dropdown"></div>';

		const revealed = await revealSidebarField( 'excerpt', { timeout: 0 } );

		expect( revealed ).toBe( false );
	} );

	it( 'leaves an already open panel alone', async () => {
		mockOpenPanels = [ 'jetpack-seo/jetpack-seo' ];
		renderSidebar( '<div class="jetpack-seo-panel"></div>' );

		await revealSidebarField( 'seo' );

		expect( mockToggleEditorPanelOpened ).not.toHaveBeenCalled();
	} );

	it( 'scrolls the field into view', async () => {
		const field = renderField();

		await revealSidebarField( 'excerpt' );

		expect( field.scrollIntoView ).toHaveBeenCalledWith( { behavior: 'smooth', block: 'center' } );
	} );

	it( 'skips the smooth scroll when the user prefers reduced motion', async () => {
		// The shared jest setup stubs matchMedia as always-false; override one call.
		( window.matchMedia as jest.Mock ).mockReturnValueOnce( { matches: true } );
		const field = renderField();

		await revealSidebarField( 'excerpt' );

		expect( field.scrollIntoView ).toHaveBeenCalledWith( { behavior: 'auto', block: 'center' } );
	} );

	it( 'returns false without touching the editor when the interface store is unavailable', async () => {
		mockStoresRegistered = false;
		renderField();

		await expect( revealSidebarField( 'excerpt' ) ).resolves.toBe( false );
		expect( mockClearSelectedBlock ).not.toHaveBeenCalled();
	} );

	it.each( [
		'fields-controls__featured-image-image',
		'fields-controls__featured-image-placeholder',
	] )( 'reveals the featured image summary row rendered as .%s', async ( className ) => {
		mockOpenPanels = [ 'post-status' ];
		const sidebar = renderSidebar( `<span class="${ className }"></span>` );
		const field = sidebar.querySelector< HTMLElement >( `.${ className }` )!;
		field.scrollIntoView = jest.fn();

		const revealed = await revealSidebarField( 'featuredImage' );

		expect( revealed ).toBe( true );
		expect( field.scrollIntoView ).toHaveBeenCalled();
		// A row is not a panel, so the classic panel opened to look inside it closes again.
		expect( mockOpenPanels ).toEqual( [ 'post-status' ] );
	} );

	it( 'opens the classic featured image panel and leaves it open', async () => {
		renderSidebar( '<div class="editor-post-featured-image"></div>' );

		const revealed = await revealSidebarField( 'featuredImage' );

		expect( revealed ).toBe( true );
		expect( mockOpenPanels ).toEqual( [ 'featured-image' ] );
	} );

	it( 'resolves false when opening the sidebar rejects', async () => {
		mockEnableComplementaryArea.mockRejectedValueOnce( new Error( 'no such area' ) );
		renderField();

		await expect( revealSidebarField( 'excerpt' ) ).resolves.toBe( false );
	} );

	it( 'leaves focus where the user put it', async () => {
		renderField();
		const chatInput = document.createElement( 'textarea' );
		document.body.appendChild( chatInput );
		chatInput.focus();

		await revealSidebarField( 'excerpt' );

		expect( document.activeElement ).toBe( chatInput );
	} );
} );
