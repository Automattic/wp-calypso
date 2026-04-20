import { Chat, OdieChat } from '../../types';
import { convertOdieChatToOdieConversation, hasRecentEscalationAttempt } from '../chat-utils';

// Helper to create a date string in the format 'YYYY-MM-DD HH:MM:SS'
const formatDate = ( date: Date ): string => {
	return date.toISOString().replace( 'T', ' ' ).slice( 0, 19 );
};

describe( 'hasRecentEscalationAttempt', () => {
	it( 'returns false when chat is undefined', () => {
		expect( hasRecentEscalationAttempt( undefined as unknown as Chat ) ).toBe( false );
	} );

	it( 'returns false when chat has no messages', () => {
		const chat: Chat = {
			messages: [],
			conversationId: null,
			provider: 'odie',
			status: 'loaded',
		};

		expect( hasRecentEscalationAttempt( chat ) ).toBe( false );
	} );

	it( 'returns false when no messages have forward_to_human_support flag set to true or no created_at', () => {
		const chat: Chat = {
			messages: [
				{
					content: 'Hello',
					role: 'user',
					type: 'message',
				},
				{
					content: 'Hi there',
					role: 'bot',
					type: 'message',
					created_at: formatDate( new Date() ),
					context: {
						site_id: null,
						flags: {
							forward_to_human_support: false,
						},
					},
				},
			],
			conversationId: null,
			provider: 'odie',
			status: 'loaded',
		};

		expect( hasRecentEscalationAttempt( chat ) ).toBe( false );
	} );

	it( 'returns true when message with flag is within last 3 days', () => {
		const twoDaysAgo = new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 );
		const chat: Chat = {
			messages: [
				{
					content: 'I need help',
					role: 'user',
					type: 'message',
					created_at: formatDate( twoDaysAgo ),
					context: {
						site_id: null,
						flags: {
							forward_to_human_support: true,
						},
					},
				},
			],
			conversationId: null,
			provider: 'odie',
			status: 'loaded',
		};

		expect( hasRecentEscalationAttempt( chat ) ).toBe( true );
	} );

	it( 'returns false when message with flag is older than 3 days', () => {
		const fourDaysAgo = new Date( Date.now() - 4 * 24 * 60 * 60 * 1000 );
		const chat: Chat = {
			messages: [
				{
					content: 'I need help',
					role: 'user',
					type: 'message',
					created_at: formatDate( fourDaysAgo ),
					context: {
						site_id: null,
						flags: {
							forward_to_human_support: true,
						},
					},
				},
			],
			conversationId: null,
			provider: 'odie',
			status: 'loaded',
		};

		expect( hasRecentEscalationAttempt( chat ) ).toBe( false );
	} );
} );

describe( 'convertOdieChatToOdieConversation', () => {
	const sessionId = 'test-session-id';
	const botSlug = 'wpcom-support-chat';

	it( 'does not throw and falls back to createdAt 0 when messages array is empty', () => {
		const emptyChatLoggedOut: OdieChat = {
			odieId: 42,
			messages: [],
		};

		const result = convertOdieChatToOdieConversation( emptyChatLoggedOut, sessionId, botSlug );

		expect( result.id ).toBe( '42' );
		expect( result.createdAt ).toBe( 0 );
		expect( result.metadata.createdAt ).toBe( 0 );
		expect( result.messages ).toHaveLength( 0 );
	} );

	it( 'converts an OdieChat with messages correctly', () => {
		const ts = 1700000000;
		const chatWithMessages: OdieChat = {
			odieId: 7,
			messages: [
				{ role: 'user', type: 'message', content: 'Hello', ts },
				{ role: 'bot', type: 'message', content: 'Hi there', ts: ts + 10 },
			],
		};

		const result = convertOdieChatToOdieConversation( chatWithMessages, sessionId, botSlug );

		expect( result.id ).toBe( '7' );
		expect( result.createdAt ).toBe( ts );
		expect( result.metadata.odieChatId ).toBe( 7 );
		expect( result.metadata.createdAt ).toBe( ts );
		expect( result.metadata.sessionId ).toBe( sessionId );
		expect( result.metadata.botSlug ).toBe( botSlug );
		expect( result.messages ).toHaveLength( 2 );
		expect( result.messages[ 0 ] ).toEqual( { received: ts, role: 'user', text: 'Hello' } );
	} );
} );
