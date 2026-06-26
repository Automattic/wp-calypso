/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';
import type { ZendeskConversation } from '../../types';

const mockGetActiveSessionId = jest.fn();
const mockLoadAllMessagesFromServer = jest.fn();
const mockNavigate = jest.fn();
const mockUseGetZendeskConversations = jest.fn();

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		createOdieBotId: ( agentId: string ) => `odie-${ agentId }`,
		isOdieBotId: () => false,
		loadAllMessagesFromServer: ( ...args: unknown[] ) => mockLoadAllMessagesFromServer( ...args ),
	} ),
	{ virtual: true }
);

jest.mock( '@automattic/components', () => ( {
	SummaryButton: ( {
		title,
		description,
		onClick,
		disabled,
	}: {
		title: ReactNode;
		description?: ReactNode;
		onClick?: MouseEventHandler;
		disabled?: boolean;
	} ) => (
		<button type="button" onClick={ onClick } disabled={ disabled }>
			<span>{ title }</span>
			{ description && <span>{ description }</span> }
		</button>
	),
	TimeSince: ( { date }: { date: string } ) => <time dateTime={ date }>2h ago</time>,
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useGetZendeskConversations: ( enabled: boolean ) => mockUseGetZendeskConversations( enabled ),
} ) );

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		agentConfig: {
			agentId: 'woo-workflow-orchestrator',
			agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
			sessionId: 'ai-chat-123',
		},
		getActiveSessionId: mockGetActiveSessionId,
		zendeskSmoochIntegrationKey: 'woo',
	} ),
} ) );

import { EscalationButton, findConversationByChatSessionId } from '../escalation-button';

function createConversation(
	id: string,
	chatSessionId: string,
	placement: 'metadata' | 'top-level' = 'metadata'
) {
	return {
		id,
		...( placement === 'metadata'
			? { metadata: { chat_session_id: chatSessionId, createdAt: 1718193600000 } }
			: { chat_session_id: chatSessionId } ),
	} as unknown as ZendeskConversation;
}

describe( 'EscalationButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetActiveSessionId.mockReturnValue( 'ai-chat-123' );
		mockUseGetZendeskConversations.mockReturnValue( {
			conversations: [],
			isLoading: false,
		} );
		mockLoadAllMessagesFromServer.mockResolvedValue( {
			chatId: 5587242,
			messages: [],
			pagination: {},
			sessionId: 'ai-chat-123',
		} );
	} );

	it( 'continues an existing Zendesk conversation for the active AI chat', () => {
		mockUseGetZendeskConversations.mockReturnValue( {
			conversations: [ createConversation( 'conversation-1', 'ai-chat-123' ) ],
			isLoading: false,
		} );

		render( <EscalationButton messageId="message-1" /> );

		expect( screen.getByText( 'Continue existing chat' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Continue chat started 2h ago' );

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( mockNavigate ).toHaveBeenCalledWith( '/zendesk', {
			state: { conversationId: 'conversation-1' },
		} );
	} );

	it( 'starts a new Zendesk conversation when no active AI chat match exists', async () => {
		mockUseGetZendeskConversations.mockReturnValue( {
			conversations: [ createConversation( 'conversation-1', 'other-ai-chat' ) ],
			isLoading: false,
		} );

		render( <EscalationButton messageId="message-1" /> );

		expect( screen.getByText( 'Switch to Happiness Engineer' ) ).toBeInTheDocument();
		expect( screen.getByText( 'A new chat will start' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( mockNavigate ).toHaveBeenCalledWith( '/zendesk', {
				state: {
					startedFromChatSessionId: 'ai-chat-123',
					startedFromAiChatId: 5587242,
					startedFromMessageId: 'message-1',
				},
			} )
		);

		expect( mockLoadAllMessagesFromServer ).toHaveBeenCalledWith(
			'ai-chat-123',
			expect.objectContaining( {
				apiBaseUrl: 'https://public-api.wordpress.com',
				botId: expect.any( String ),
			} ),
			1,
			true
		);
	} );

	it( 'still starts a new Zendesk conversation when the numeric AI chat id cannot be loaded', async () => {
		mockLoadAllMessagesFromServer.mockRejectedValueOnce( new Error( 'missing chat' ) );

		render( <EscalationButton messageId="message-1" /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( mockNavigate ).toHaveBeenCalledWith( '/zendesk', {
				state: {
					startedFromChatSessionId: 'ai-chat-123',
					startedFromMessageId: 'message-1',
				},
			} )
		);
	} );

	it( 'disables the button while Zendesk conversations are loading', () => {
		mockUseGetZendeskConversations.mockReturnValue( {
			conversations: [],
			isLoading: true,
		} );

		render( <EscalationButton messageId="message-1" /> );

		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'matches conversations with metadata or top-level chat_session_id values', () => {
		const conversations = [
			createConversation( 'metadata-conversation', 'metadata-chat' ),
			createConversation( 'top-level-conversation', 'top-level-chat', 'top-level' ),
		];

		expect( findConversationByChatSessionId( conversations, 'metadata-chat' )?.id ).toBe(
			'metadata-conversation'
		);
		expect( findConversationByChatSessionId( conversations, 'top-level-chat' )?.id ).toBe(
			'top-level-conversation'
		);
	} );
} );
