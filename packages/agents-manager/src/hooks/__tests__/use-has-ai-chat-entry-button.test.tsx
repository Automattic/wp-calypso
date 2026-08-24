/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { renderHook, act } from '@testing-library/react';

const mockIsEditorAiEntryEnabled = jest.fn( () => false );
const mockIsAdminBarInEditor = jest.fn( () => false );

// The real checks read `window.matchMedia` and Gutenberg globals; mock them
// down to controllable flags.
jest.mock( '../../utils/editor-entry-points', () => ( {
	isEditorAiEntryEnabled: () => mockIsEditorAiEntryEnabled(),
	isAdminBarInEditor: () => mockIsAdminBarInEditor(),
} ) );

import useHasAiChatEntryButton, { hasAiChatEntryButton } from '../use-has-ai-chat-entry-button';

const AI_CHAT_BUTTON_ID = 'wp-admin-bar-agents-manager-ai-chat';
const MASTERBAR_BUTTON_CLASS = 'masterbar__item-agents-manager-ai-chat';

const setUrl = ( path: string ) => window.history.replaceState( {}, '', path );

const installAdminBarButton = () => {
	const button = document.createElement( 'div' );
	button.id = AI_CHAT_BUTTON_ID;
	document.body.appendChild( button );
};

const installMasterbarButton = () => {
	const button = document.createElement( 'div' );
	button.className = MASTERBAR_BUTTON_CLASS;
	document.body.appendChild( button );
};

afterEach( () => {
	// `replaceState` is patched to notify subscribers, so wrap the reset in
	// `act()` to flush any hook still mounted during teardown.
	act( () => setUrl( '/' ) );
	document.body.innerHTML = '';
	mockIsEditorAiEntryEnabled.mockReturnValue( false );
	mockIsAdminBarInEditor.mockReturnValue( false );
} );

describe( 'hasAiChatEntryButton', () => {
	describe( 'on the Site Editor navigation view', () => {
		beforeEach( () => {
			setUrl( '/wp-admin/site-editor.php' );
			// Force the toolbar entry `true` — `isEditorAiEntryEnabled()` has no
			// navigation-view exclusion, so the navigation-view branch must
			// ignore it since the toolbar isn't rendered there.
			mockIsEditorAiEntryEnabled.mockReturnValue( true );
		} );

		it.each( [
			{
				expected: false,
				because: 'the admin-bar button markup is hidden without the omnibar',
				omnibar: false,
				buttonInDom: true,
			},
			{
				expected: true,
				because: 'the omnibar shows the admin-bar button',
				omnibar: true,
				buttonInDom: true,
			},
			{
				expected: false,
				because: 'the omnibar has no AI chat button',
				omnibar: true,
				buttonInDom: false,
			},
		] )( 'is $expected when $because', ( { omnibar, buttonInDom, expected } ) => {
			mockIsAdminBarInEditor.mockReturnValue( omnibar );
			if ( buttonInDom ) {
				installAdminBarButton();
			}

			expect( hasAiChatEntryButton() ).toBe( expected );
		} );
	} );

	describe( 'everywhere else', () => {
		it( 'counts the editor toolbar entry in the Site Editor editing canvas', () => {
			setUrl( '/wp-admin/site-editor.php?canvas=edit' );
			mockIsEditorAiEntryEnabled.mockReturnValue( true );

			expect( hasAiChatEntryButton() ).toBe( true );
		} );

		it( 'counts the wp-admin bar button', () => {
			setUrl( '/wp-admin/index.php' );
			installAdminBarButton();

			expect( hasAiChatEntryButton() ).toBe( true );
		} );

		it( 'counts the Calypso masterbar button', () => {
			installMasterbarButton();

			expect( hasAiChatEntryButton() ).toBe( true );
		} );

		it( 'is false without any entry button', () => {
			expect( hasAiChatEntryButton() ).toBe( false );
		} );
	} );
} );

describe( 'useHasAiChatEntryButton', () => {
	it( "reacts to the Site Editor's client-side navigation between the canvas and the navigation view", () => {
		setUrl( '/wp-admin/site-editor.php?canvas=edit' );
		mockIsEditorAiEntryEnabled.mockReturnValue( true );

		const { result } = renderHook( () => useHasAiChatEntryButton() );
		expect( result.current ).toBe( true );

		act( () => window.history.pushState( {}, '', '/wp-admin/site-editor.php' ) );
		expect( result.current ).toBe( false );

		act( () => window.history.pushState( {}, '', '/wp-admin/site-editor.php?canvas=edit' ) );
		expect( result.current ).toBe( true );
	} );
} );
