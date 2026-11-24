import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { useSendChatMessage } from '../use-send-chat-message';
import type { Message } from '../../types';
import type { ReactNode } from 'react';

const mockCreateZendeskConversation = vi.fn();
const mockSendOdieMessage = vi.fn();

vi.mock( '../../context', () => ( {
	useOdieAssistantContext: () => ( {
		addMessage: vi.fn(),
		chat: { provider: 'odie', conversationId: null, status: 'loaded', messages: [] },
		isUserEligibleForPaidSupport: true,
	} ),
} ) );
vi.mock( '../../data', () => ( {
	useSendOdieMessage: () => ( { mutateAsync: mockSendOdieMessage } ),
} ) );
vi.mock( '../use-send-zendesk-message', () => ( {
	useSendZendeskMessage: () => ( { mutateAsync: vi.fn() } ),
} ) );
vi.mock( '../use-create-zendesk-conversation', () => ( {
	useCreateZendeskConversation: () => mockCreateZendeskConversation,
} ) );

const message = { content: 'My card was declined', role: 'user', type: 'message' } as Message;

// A chat that goes straight to a person, waiting for the user's first message.
const renderWaitingChat = () =>
	renderHook( () => useSendChatMessage(), {
		wrapper: ( { children }: { children: ReactNode } ) => (
			<MemoryRouter initialEntries={ [ '/odie?direct-zd-chat=1&start-on-message=1' ] }>
				{ children }
			</MemoryRouter>
		),
	} );

beforeEach( () => {
	vi.clearAllMocks();
} );

describe( 'useSendChatMessage while a chat with a person waits for the first message', () => {
	it( 'starts that chat with the message instead of asking the AI', async () => {
		mockCreateZendeskConversation.mockResolvedValue( 'conv-1' );
		const { result } = renderWaitingChat();

		await act( () => result.current.sendMessage( message ) );

		expect( mockCreateZendeskConversation ).toHaveBeenCalledWith( {
			createdFrom: 'direct_url',
			firstMessage: message,
		} );
		expect( mockSendOdieMessage ).not.toHaveBeenCalled();
	} );
} );
