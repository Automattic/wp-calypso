import { renderHook } from '@testing-library/react';
import Smooch from 'smooch';
import { type Mock, vi } from 'vitest';
import { useOdieAssistantContext } from '../../context';
import { useZendeskMessageListener } from '../use-zendesk-message-listener';
import type { Message } from '../../types';

const mockTrackEvent = vi.fn();

vi.mock( 'smooch', () => ( {
	default: { on: vi.fn(), off: vi.fn(), markAllAsRead: vi.fn() },
} ) );
vi.mock( '@automattic/zendesk-client', () => ( {
	zendeskMessageConverter: ( message: unknown ) => message,
} ) );
vi.mock( '@wordpress/data', () => ( {
	useSelect: () => ( { isChatLoaded: true } ),
} ) );
vi.mock( '../../constants', () => ( { HELP_CENTER_STORE: 'automattic/help-center' } ) );
vi.mock( '../../context', () => ( { useOdieAssistantContext: vi.fn() } ) );
vi.mock( '../use-get-combined-chat', () => ( {
	deduplicateZDMessages: ( messages: unknown[] ) => messages,
} ) );

const agentMessage = {
	role: 'business',
	text: 'Hi, I can help',
	type: 'text',
	metadata: { '__zendesk_msg.agent.id': '4242' },
};
// A trigger or the move to email: from the business, but not from an agent.
const automatedMessage = {
	role: 'business',
	text: 'We will reply by email',
	type: 'text',
	metadata: { '__zendesk_msg.agent.id': '' },
};

const receive = ( message: unknown, chatMessages: unknown[] = [] ) => {
	( useOdieAssistantContext as Mock ).mockReturnValue( {
		chat: { conversationId: 'conv-1', messages: chatMessages as Message[] },
		setChat: vi.fn(),
		trackEvent: mockTrackEvent,
	} );
	renderHook( () => useZendeskMessageListener() );
	const listener = vi.mocked( Smooch.on ).mock.lastCall?.[ 1 ] as (
		message: unknown,
		data: { conversation: { id: string } }
	) => void;

	listener( message, { conversation: { id: 'conv-1' } } );
};

beforeEach( () => {
	vi.clearAllMocks();
} );

describe( 'useZendeskMessageListener', () => {
	it( "records the agent joining on a Happiness Engineer's first message", () => {
		receive( agentMessage, [ automatedMessage ] );

		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_agent_joined', {
			conversation_id: 'conv-1',
		} );
	} );

	it.each( [
		[ 'an automated message', automatedMessage, [] ],
		[ "an agent's later message", agentMessage, [ agentMessage ] ],
	] )( "doesn't record the agent joining on %s", ( _name, message, chatMessages ) => {
		receive( message, chatMessages );

		expect( mockTrackEvent ).not.toHaveBeenCalled();
	} );
} );
