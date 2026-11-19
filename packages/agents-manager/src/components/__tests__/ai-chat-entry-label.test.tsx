/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { type MockedFunction, vi } from 'vitest';
import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import AiChatEntryLabel from '../ai-chat-entry-label';

vi.mock( '../../hooks/use-ai-chat-entry-state', () => ( { useAiChatEntryState: vi.fn() } ) );

const mockUseAiChatEntryState = useAiChatEntryState as MockedFunction< typeof useAiChatEntryState >;

describe( 'AiChatEntryLabel', () => {
	it( 'shows the Agent label while the chat is hidden', () => {
		mockUseAiChatEntryState.mockReturnValue( { hasLoaded: true, isChatVisible: false } );

		render( <AiChatEntryLabel>Agent</AiChatEntryLabel> );

		expect( screen.getByText( 'Agent' ) ).toBeVisible();
	} );

	it.each( [
		[ 'the chat is visible', { hasLoaded: true, isChatVisible: true }, 'Agent' ],
		[ 'the persisted state has not loaded', { hasLoaded: false, isChatVisible: false }, 'Agent' ],
		[ 'there is no text', { hasLoaded: true, isChatVisible: false }, undefined ],
	] )( 'renders nothing while %s', ( _case, state, text ) => {
		mockUseAiChatEntryState.mockReturnValue( state );

		const { container } = render( <AiChatEntryLabel>{ text }</AiChatEntryLabel> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
