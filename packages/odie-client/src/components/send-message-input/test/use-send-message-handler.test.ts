/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useSendMessageHandler } from '../use-send-message-handler';
import type { Chat, Message } from '../../../types';

jest.mock( 'smooch', () => ( {
	__esModule: true,
	default: { stopTyping: jest.fn() },
} ) );

const userMessage = ( content: string ): Message =>
	( { content, role: 'user', type: 'message' } ) as Message;
const botMessage = ( content: string ): Message =>
	( { content, role: 'bot', type: 'message' } ) as Message;

function makeChat( { provider = 'odie', messages = [] as Message[] } = {} ) {
	return { provider, messages, conversationId: null } as unknown as Chat;
}

function setup( chat: Chat ) {
	const trackEvent = jest.fn();
	const sendMessage = jest.fn().mockResolvedValue( undefined );
	const textareaRef = { current: { focus: jest.fn() } };

	const { result } = renderHook( () =>
		useSendMessageHandler( {
			inputValue: 'How do I add a domain?',
			setInputValue: jest.fn(),
			hasAttachments: false,
			isChatBusy: false,
			chat,
			sendAttachments: jest.fn(),
			textareaRef: textareaRef as unknown as React.RefObject< HTMLTextAreaElement >,
			trackEvent,
			sendMessage,
		} )
	);

	return { send: result.current, trackEvent };
}

const startEvents = ( trackEvent: jest.Mock ) =>
	trackEvent.mock.calls.filter( ( [ name ] ) => name === 'chat_conversation_start' );

describe( 'useSendMessageHandler conversation start tracking', () => {
	it( 'records a conversation start on the first user message', async () => {
		const { send, trackEvent } = setup( makeChat() );

		await act( async () => {
			await send();
		} );

		expect( startEvents( trackEvent ) ).toHaveLength( 1 );
		expect( trackEvent ).toHaveBeenCalledWith( 'chat_conversation_start', {
			message_length: 'How do I add a domain?'.length,
			provider: 'odie',
		} );
	} );

	it( 'still records a start when only the bot has spoken', async () => {
		const { send, trackEvent } = setup( makeChat( { messages: [ botMessage( 'Hi there' ) ] } ) );

		await act( async () => {
			await send();
		} );

		expect( startEvents( trackEvent ) ).toHaveLength( 1 );
	} );

	it( 'does not record a start on a follow-up message', async () => {
		const { send, trackEvent } = setup(
			makeChat( { messages: [ userMessage( 'First' ), botMessage( 'Answer' ) ] } )
		);

		await act( async () => {
			await send();
		} );

		expect( startEvents( trackEvent ) ).toHaveLength( 0 );
	} );

	it( 'does not record a start for a Zendesk conversation', async () => {
		const { send, trackEvent } = setup( makeChat( { provider: 'zendesk' } ) );

		await act( async () => {
			await send();
		} );

		expect( startEvents( trackEvent ) ).toHaveLength( 0 );
	} );

	it( 'always records the message send event alongside the start', async () => {
		const { send, trackEvent } = setup( makeChat() );

		await act( async () => {
			await send();
		} );

		expect( trackEvent ).toHaveBeenCalledWith( 'chat_message_action_send', {
			message_length: 'How do I add a domain?'.length,
			provider: 'odie',
		} );
	} );
} );
