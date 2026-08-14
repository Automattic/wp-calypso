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
 * layout of excerpt text beside the edit button. jsdom implements neither
 * scrollIntoView nor focus tracking, so both are stubbed to make the calls
 * observable.
 */
function renderField() {
	const sidebar = renderSidebar(
		'<div class="excerpt-row"><p>New excerpt</p><div class="editor-post-excerpt__dropdown"></div></div>'
	);
	const field = sidebar.querySelector< HTMLElement >( '.editor-post-excerpt__dropdown' )!;
	field.scrollIntoView = jest.fn();
	field.focus = jest.fn();
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

	it( "reveals Jetpack's AI excerpt panel, which replaces the core excerpt", async () => {
		const sidebar = renderSidebar( '<div class="jetpack-ai-post-excerpt"></div>' );
		const field = sidebar.querySelector< HTMLElement >( '.jetpack-ai-post-excerpt' )!;
		field.scrollIntoView = jest.fn();

		const revealed = await revealSidebarField( 'excerpt' );

		expect( revealed ).toBe( true );
		expect( field.scrollIntoView ).toHaveBeenCalled();
	} );

	it( 'restores the panel preference when the field never appears', async () => {
		mockOpenPanels = [ 'post-status' ];
		renderSidebar( '' );

		const revealed = await revealSidebarField( 'seo', { timeout: 0 } );

		expect( revealed ).toBe( false );
		expect( mockOpenPanels ).toEqual( [ 'post-status' ] );
	} );

	it( 'clears the block selection and opens the document sidebar', async () => {
		renderSidebar( '<div class="editor-post-excerpt__dropdown"></div>' );

		const revealed = await revealSidebarField( 'excerpt' );

		expect( revealed ).toBe( true );
		expect( mockClearSelectedBlock ).toHaveBeenCalled();
		expect( mockEnableComplementaryArea ).toHaveBeenCalledWith( 'core', 'edit-post/document' );
	} );

	it( 'returns false when the field never renders', async () => {
		renderSidebar( '' );

		const revealed = await revealSidebarField( 'excerpt', { timeout: 0 } );

		expect( revealed ).toBe( false );
	} );

	it( 'ignores a matching element outside the document sidebar', async () => {
		document.body.innerHTML = '<div class="editor-post-excerpt__dropdown"></div>';

		const revealed = await revealSidebarField( 'excerpt', { timeout: 0 } );

		expect( revealed ).toBe( false );
	} );

	it( 'opens a collapsed panel for fields that declare one', async () => {
		renderSidebar( '<div class="jetpack-seo-panel"></div>' );

		await revealSidebarField( 'seo' );

		expect( mockToggleEditorPanelOpened ).toHaveBeenCalledWith( 'jetpack-seo/jetpack-seo' );
	} );

	it( 'leaves an already open panel alone', async () => {
		mockOpenPanels = [ 'jetpack-seo/jetpack-seo' ];
		renderSidebar( '<div class="jetpack-seo-panel"></div>' );

		await revealSidebarField( 'seo' );

		expect( mockToggleEditorPanelOpened ).not.toHaveBeenCalled();
	} );

	it( 'leaves panel preferences untouched when the matched variant needs no panel', async () => {
		mockOpenPanels = [ 'post-status' ];
		renderField();

		await revealSidebarField( 'excerpt' );

		expect( mockOpenPanels ).toEqual( [ 'post-status' ] );
	} );

	it( 'scrolls the field into view', async () => {
		const field = renderField();

		await revealSidebarField( 'excerpt' );

		expect( field.scrollIntoView ).toHaveBeenCalledWith(
			expect.objectContaining( { block: 'center' } )
		);
	} );

	it( 'resolves false rather than rejecting when the editor stores are missing', async () => {
		mockStoresRegistered = false;
		renderField();

		await expect( revealSidebarField( 'excerpt' ) ).resolves.toBe( false );
	} );

	it( 'reveals the featured image where the summary renders it as a row', async () => {
		mockOpenPanels = [ 'post-status' ];
		const sidebar = renderSidebar( '<span class="fields-controls__featured-image-image"></span>' );
		const field = sidebar.querySelector< HTMLElement >( '.fields-controls__featured-image-image' )!;
		field.scrollIntoView = jest.fn();

		const revealed = await revealSidebarField( 'featuredImage' );

		expect( revealed ).toBe( true );
		expect( field.scrollIntoView ).toHaveBeenCalled();
		// A row is not a panel, so the classic panel opened to look inside it closes again.
		expect( mockOpenPanels ).toEqual( [ 'post-status' ] );
	} );

	it( 'reveals the summary row while the post still has no featured image', async () => {
		const sidebar = renderSidebar(
			'<span class="fields-controls__featured-image-placeholder"></span>'
		);
		const field = sidebar.querySelector< HTMLElement >(
			'.fields-controls__featured-image-placeholder'
		)!;
		field.scrollIntoView = jest.fn();

		const revealed = await revealSidebarField( 'featuredImage' );

		expect( revealed ).toBe( true );
		expect( field.scrollIntoView ).toHaveBeenCalled();
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
		const field = renderField();
		const chatInput = document.createElement( 'textarea' );
		document.body.appendChild( chatInput );
		chatInput.focus();

		await revealSidebarField( 'excerpt' );

		expect( document.activeElement ).toBe( chatInput );
		expect( field.focus ).not.toHaveBeenCalled();
	} );
} );
