/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );

import {
	AI_CHAT_ENTRY_BUTTON_ID,
	EDITOR_HELP_ENTRY_BUTTON_ID,
	hasAgentsManagerEntryPoint,
	hasAgentsManagerHelpMenu,
	hasAiChatEntryButton,
} from '../use-admin-bar-integration';

function appendElement( options: { id?: string; className?: string } ) {
	const element = document.createElement( 'div' );
	if ( options.id ) {
		element.id = options.id;
	}
	if ( options.className ) {
		element.className = options.className;
	}
	document.body.appendChild( element );
	return element;
}

describe( 'use-admin-bar-integration entry detection', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'detects the wp-admin AI chat button as an AI chat entry', () => {
		appendElement( { id: AI_CHAT_ENTRY_BUTTON_ID } );

		expect( hasAiChatEntryButton() ).toBe( true );
		expect( hasAgentsManagerEntryPoint() ).toBe( true );
	} );

	it( 'detects the Calypso masterbar AI chat button as an AI chat entry', () => {
		appendElement( { className: 'masterbar__item-agents-manager-ai-chat' } );

		expect( hasAiChatEntryButton() ).toBe( true );
		expect( hasAgentsManagerEntryPoint() ).toBe( true );
	} );

	it( 'detects the Help menu as an Agents Manager entry point', () => {
		appendElement( { id: 'wp-admin-bar-agents-manager' } );

		expect( hasAgentsManagerHelpMenu() ).toBe( true );
		expect( hasAiChatEntryButton() ).toBe( false );
		expect( hasAgentsManagerEntryPoint() ).toBe( true );
	} );

	it( 'detects the editor Help button as an Agents Manager entry point', () => {
		appendElement( { id: EDITOR_HELP_ENTRY_BUTTON_ID } );

		expect( hasAgentsManagerHelpMenu() ).toBe( true );
		expect( hasAiChatEntryButton() ).toBe( false );
		expect( hasAgentsManagerEntryPoint() ).toBe( true );
	} );

	it( 'returns false when no Agents Manager entry point is present', () => {
		expect( hasAgentsManagerHelpMenu() ).toBe( false );
		expect( hasAiChatEntryButton() ).toBe( false );
		expect( hasAgentsManagerEntryPoint() ).toBe( false );
	} );
} );
