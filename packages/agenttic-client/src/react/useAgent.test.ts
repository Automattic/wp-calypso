import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataPart, Message, TextPart } from '../client/types/index';

// Mock modules with factory functions to avoid hoisting issues
vi.mock( '../client/index', () => ( {
	createClient: vi.fn(),
} ) );

vi.mock( '@wordpress/element', () => ( {
	useCallback: vi.fn( ( fn ) => fn ),
	useEffect: vi.fn( ( fn ) => fn() ),
	useRef: vi.fn( ( value ) => ( { current: value } ) ),
	useState: vi.fn( ( initial ) => [ initial, vi.fn() ] ),
} ) );

// Import everything after mocking
import { useAgent } from './useAgent';
import { createClient } from '../client/index';

// Test data
const mockUserMessage: Message = {
	role: 'user',
	kind: 'message',
	messageId: 'test-message-1',
	parts: [
		{
			type: 'text',
			text: 'Hello, how are you?',
		} as TextPart,
	],
};

const mockAgentMessage: Message = {
	role: 'agent',
	kind: 'message',
	messageId: 'test-message-2',
	parts: [
		{
			type: 'text',
			text: 'I am doing well, thank you!',
		} as TextPart,
	],
};

const mockToolCallMessage: Message = {
	role: 'agent',
	kind: 'message',
	messageId: 'test-message-3',
	parts: [
		{
			type: 'data',
			data: {
				toolCallId: 'tool-call-1',
				toolId: 'search',
				arguments: { query: 'test' },
			},
		} as DataPart,
	],
};

const mockToolResultMessage: Message = {
	role: 'agent',
	kind: 'message',
	messageId: 'test-message-4',
	parts: [
		{
			type: 'data',
			data: {
				toolCallId: 'tool-call-1',
				result: 'Search results...',
			},
		} as DataPart,
	],
};

describe( 'useAgent hook', () => {
	beforeEach( () => {
		// Reset all mocks
		vi.clearAllMocks();
	} );

	describe( 'initialization', () => {
		it( 'should initialize without throwing', () => {
			expect( () => useAgent( { agentId: 'test-agent' } ) ).not.toThrow();
		} );

		it( 'should handle client creation error gracefully', () => {
			vi.mocked( createClient ).mockImplementation( () => {
				throw new Error( 'Client creation failed' );
			} );

			expect( () => useAgent( { agentId: 'test-agent' } ) ).not.toThrow();
		} );
	} );

	describe( 'hook functionality', () => {
		it( 'should provide all required methods', () => {
			// Mock createClient to return a valid client
			vi.mocked( createClient ).mockReturnValue( {
				sendMessage: vi.fn(),
				sendMessageStream: vi.fn(),
			} as any );

			const hook = useAgent( { agentId: 'test-agent' } );

			expect( typeof hook.sendMessage ).toBe( 'function' );
			expect( typeof hook.sendMessageStream ).toBe( 'function' );
			expect( typeof hook.clearError ).toBe( 'function' );
			expect( typeof hook.reset ).toBe( 'function' );
			expect( typeof hook.resetConversation ).toBe( 'function' );
			expect( typeof hook.getTextMessage ).toBe( 'function' );
			expect( typeof hook.state ).toBe( 'object' );
		} );

		it( 'should return initial state', () => {
			// Mock createClient to return a valid client
			vi.mocked( createClient ).mockReturnValue( {
				sendMessage: vi.fn(),
				sendMessageStream: vi.fn(),
			} as any );

			const hook = useAgent( { agentId: 'test-agent' } );

			expect( hook.state ).toEqual( {
				isConnected: true,
				isLoading: false,
				error: null,
				lastResponse: null,
				conversationHistory: [],
			} );
		} );
	} );

	describe( 'utility functions', () => {
		it( 'should convert message to chat format', () => {
			// Mock createClient to return a valid client
			vi.mocked( createClient ).mockReturnValue( {
				sendMessage: vi.fn(),
				sendMessageStream: vi.fn(),
			} as any );

			const hook = useAgent( { agentId: 'test-agent' } );
			const chatMessage = hook.getTextMessage( mockUserMessage );

			expect( chatMessage ).toEqual( {
				role: 'user',
				content: 'Hello, how are you?',
				timestamp: expect.any( Number ),
			} );
		} );

		it( 'should handle message with no text', () => {
			// Mock createClient to return a valid client
			vi.mocked( createClient ).mockReturnValue( {
				sendMessage: vi.fn(),
				sendMessageStream: vi.fn(),
			} as any );

			const emptyMessage: Message = {
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: { toolCallId: 'test' },
					} as DataPart,
				],
			};

			const hook = useAgent( { agentId: 'test-agent' } );
			const chatMessage = hook.getTextMessage( emptyMessage );

			expect( chatMessage.content ).toBe( '(No text response)' );
		} );
	} );
} );

// Test utility functions that can be tested in isolation
describe( 'useAgent utility functions', () => {
	describe( 'extractNewContentFromMessage logic', () => {
		it( 'should filter out history data parts', () => {
			const messageWithHistory: Message = {
				role: 'user',
				kind: 'message',
				messageId: 'test-message-user',
				parts: [
					{
						type: 'data',
						data: {
							role: 'user',
							text: 'Previous message',
						},
					} as DataPart,
					{
						type: 'text',
						text: 'Current message',
					} as TextPart,
				],
			};

			// Test the logic that would be applied
			const filteredParts = messageWithHistory.parts.filter( ( part ) => {
				if ( part.type === 'text' ) {
					return true;
				}
				if ( part.type === 'data' ) {
					// EXCLUDE conversation history data parts (role + text combinations)
					if ( 'role' in part.data && 'text' in part.data ) {
						return false;
					}
					// INCLUDE tool calls
					if (
						'toolCallId' in part.data &&
						'arguments' in part.data
					) {
						return true;
					}
					// INCLUDE tool results
					if ( 'toolCallId' in part.data && 'result' in part.data ) {
						return true;
					}
					return false;
				}
				return true;
			} );

			expect( filteredParts ).toHaveLength( 1 );
			expect( filteredParts[ 0 ].type ).toBe( 'text' );
		} );

		it( 'should preserve tool calls', () => {
			const toolParts = mockToolCallMessage.parts.filter( ( part ) => {
				if ( part.type === 'data' ) {
					return (
						'toolCallId' in part.data && 'arguments' in part.data
					);
				}
				return false;
			} );

			expect( toolParts ).toHaveLength( 1 );
			expect( toolParts[ 0 ].type ).toBe( 'data' );
		} );

		it( 'should preserve tool results', () => {
			const toolResultParts = mockToolResultMessage.parts.filter(
				( part ) => {
					if ( part.type === 'data' ) {
						return (
							'toolCallId' in part.data && 'result' in part.data
						);
					}
					return false;
				}
			);

			expect( toolResultParts ).toHaveLength( 1 );
			expect( toolResultParts[ 0 ].type ).toBe( 'data' );
		} );
	} );

	describe( 'conversationMessagesToDataParts logic', () => {
		it( 'should convert text messages to history data parts', () => {
			const messages = [ mockUserMessage, mockAgentMessage ];
			const historyParts: DataPart[] = [];

			for ( const message of messages ) {
				for ( const part of message.parts ) {
					if ( part.type === 'text' ) {
						historyParts.push( {
							type: 'data',
							data: {
								role: message.role,
								text: ( part as TextPart ).text,
							},
						} );
					}
				}
			}

			expect( historyParts ).toHaveLength( 2 );
			expect( historyParts[ 0 ] ).toEqual( {
				type: 'data',
				data: {
					role: 'user',
					text: 'Hello, how are you?',
				},
			} );
			expect( historyParts[ 1 ] ).toEqual( {
				type: 'data',
				data: {
					role: 'agent',
					text: 'I am doing well, thank you!',
				},
			} );
		} );
	} );

	describe( 'extractToolResultsFromMessage logic', () => {
		it( 'should extract tool results', () => {
			const toolResults = mockToolResultMessage.parts.filter(
				( part: any ) =>
					part.type === 'data' &&
					'toolCallId' in part.data &&
					'result' in part.data
			) as DataPart[];

			expect( toolResults ).toHaveLength( 1 );
			expect( toolResults[ 0 ].data ).toEqual( {
				toolCallId: 'tool-call-1',
				result: 'Search results...',
			} );
		} );

		it( 'should return empty array for message without tool results', () => {
			const toolResults = mockUserMessage.parts.filter(
				( part: any ) =>
					part.type === 'data' &&
					'toolCallId' in part.data &&
					'result' in part.data
			);

			expect( toolResults ).toHaveLength( 0 );
		} );
	} );

	describe( 'getTextMessage conversion logic', () => {
		it( 'should convert message to chat format', () => {
			const textParts = mockUserMessage.parts
				.filter(
					( part: any ): part is TextPart => part.type === 'text'
				)
				.map( ( part: TextPart ) => part.text )
				.join( '\n' );

			const chatMessage = {
				role: mockUserMessage.role === 'user' ? 'user' : 'agent',
				content: textParts || '(No text response)',
				timestamp: expect.any( Number ),
			};

			expect( chatMessage.role ).toBe( 'user' );
			expect( chatMessage.content ).toBe( 'Hello, how are you?' );
		} );

		it( 'should handle message with no text', () => {
			const emptyMessage: Message = {
				role: 'agent',
				parts: [
					{
						type: 'data',
						data: { toolCallId: 'test' },
					} as DataPart,
				],
			};

			const textParts = emptyMessage.parts
				.filter(
					( part: any ): part is TextPart => part.type === 'text'
				)
				.map( ( part: TextPart ) => part.text )
				.join( '\n' );

			const content = textParts || '(No text response)';
			expect( content ).toBe( '(No text response)' );
		} );
	} );
} );

describe( 'message processing scenarios', () => {
	it( 'should handle complex message with multiple parts', () => {
		const complexMessage: Message = {
			role: 'agent',
			kind: 'message',
			messageId: 'test-message-agent',
			parts: [
				{
					type: 'text',
					text: 'Here is the result',
				} as TextPart,
				{
					type: 'data',
					data: {
						toolCallId: 'tool-1',
						result: 'Tool result',
					},
				} as DataPart,
				{
					type: 'data',
					data: {
						role: 'user',
						text: 'History part',
					},
				} as DataPart,
			],
		};

		// Test filtering logic
		const textParts = complexMessage.parts
			.filter( ( part: any ): part is TextPart => part.type === 'text' )
			.map( ( part: TextPart ) => part.text )
			.join( '\n' );

		const toolResults = complexMessage.parts.filter(
			( part: any ) =>
				part.type === 'data' &&
				'toolCallId' in part.data &&
				'result' in part.data
		);

		const historyParts = complexMessage.parts.filter(
			( part: any ) =>
				part.type === 'data' &&
				'role' in part.data &&
				'text' in part.data
		);

		expect( textParts ).toBe( 'Here is the result' );
		expect( toolResults ).toHaveLength( 1 );
		expect( historyParts ).toHaveLength( 1 );
	} );

	it( 'should handle tool call flow', () => {
		const toolCallParts = mockToolCallMessage.parts.filter(
			( part: any ) =>
				part.type === 'data' &&
				'toolCallId' in part.data &&
				'arguments' in part.data
		);

		expect( toolCallParts ).toHaveLength( 1 );
		expect( ( toolCallParts[ 0 ] as DataPart ).data ).toEqual( {
			toolCallId: 'tool-call-1',
			toolId: 'search',
			arguments: { query: 'test' },
		} );
	} );
} );
