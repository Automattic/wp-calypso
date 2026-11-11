import { trackConversationStart } from '../track-conversation-start';
import type { Chat, Message } from '../../types';

const userMessage = ( content: string, fields: Partial< Message > = {} ): Message => ( {
	content,
	role: 'user',
	type: 'message',
	...fields,
} );
const botMessage: Message = { content: 'How can I help?', role: 'bot', type: 'message' };
const agentMessage: Message = {
	content: "Hi, I'm Kim.",
	role: 'business',
	type: 'message',
	id: 'smooch-1',
};

const chat = ( provider: Chat[ 'provider' ], messages: Message[] ): Chat => ( {
	provider,
	messages,
	conversationId: provider === 'odie' ? null : 'conversation-1',
	status: 'loaded',
} );

describe( 'trackConversationStart', () => {
	it( 'records the first message to the AI', () => {
		const trackEvent = jest.fn();

		trackConversationStart( chat( 'odie', [ botMessage ] ), 'Hello', trackEvent );

		expect( trackEvent ).toHaveBeenCalledWith( 'chat_conversation_start', {
			message_length: 5,
			provider: 'odie',
		} );
	} );

	it( 'ignores later messages to the AI', () => {
		const trackEvent = jest.fn();

		trackConversationStart(
			chat( 'odie', [ userMessage( 'Hi' ), botMessage ] ),
			'Hello again',
			trackEvent
		);

		expect( trackEvent ).not.toHaveBeenCalled();
	} );

	it( 'records the first message to a human, though the user wrote to the AI before', () => {
		const trackEvent = jest.fn();

		trackConversationStart(
			chat( 'zendesk', [ userMessage( 'Can I talk to a human?' ), botMessage, agentMessage ] ),
			'My card was declined',
			trackEvent
		);

		expect( trackEvent ).toHaveBeenCalledWith( 'chat_conversation_start', {
			message_length: 20,
			provider: 'zendesk',
		} );
	} );

	it( 'ignores later messages to a human', () => {
		const trackEvent = jest.fn();

		trackConversationStart(
			chat( 'zendesk', [
				userMessage( 'My card was declined', { id: 'smooch-2' } ),
				agentMessage,
			] ),
			'It says HYTFSI',
			trackEvent
		);

		expect( trackEvent ).not.toHaveBeenCalled();
	} );

	it( 'counts a message still queued for a human as written', () => {
		const trackEvent = jest.fn();

		trackConversationStart(
			chat( 'zendesk', [
				userMessage( 'My card was declined', { metadata: { temporary_id: 'temp-1' } } ),
			] ),
			'Hello?',
			trackEvent
		);

		expect( trackEvent ).not.toHaveBeenCalled();
	} );
} );
