/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import AiChatEntryLabel from '../ai-chat-entry-label';

jest.mock( '../../hooks/use-ai-chat-entry-state', () => ( { useAiChatEntryState: jest.fn() } ) );
jest.mock( '../ai-chat-entry-label/style.scss', () => ( {} ) );

const mockUseAiChatEntryState = useAiChatEntryState as jest.MockedFunction<
	typeof useAiChatEntryState
>;

describe( 'AiChatEntryLabel', () => {
	it( 'shows the Agent label while the chat is hidden', () => {
		mockUseAiChatEntryState.mockReturnValue( { isChatVisible: false, isLabelVisible: true } );

		render( <AiChatEntryLabel /> );

		expect( screen.getByText( 'Agent' ) ).toBeVisible();
	} );

	it( 'renders nothing while the chat is visible', () => {
		mockUseAiChatEntryState.mockReturnValue( { isChatVisible: true, isLabelVisible: false } );

		const { container } = render( <AiChatEntryLabel /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
