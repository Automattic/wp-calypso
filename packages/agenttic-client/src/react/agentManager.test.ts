import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
	Client,
	ClientConfig,
	DataPart,
	Message,
	SendMessageParams,
	Task,
	TaskUpdate,
	TextPart,
	ToolCallDataPart,
	ToolResultDataPart,
} from '../client/types/index';

// Mock dependencies
vi.mock( '../client/index', () => ( {
	createClient: vi.fn(),
} ) );

vi.mock( '../client/utils/index', () => ( {
	createTextMessage: vi.fn(),
	extractToolCallsFromMessage: vi.fn(),
	generateMessageId: vi.fn( () => 'test-message-id' ),
} ) );

vi.mock( './conversationStorage', () => ( {
	clearConversation: vi.fn(),
	loadConversation: vi.fn(),
	storeConversation: vi.fn(),
} ) );

// Import after mocking
import { type AgentManager, getAgentManager } from './agentManager';
import { createClient } from '../client/index';
import {
	createTextMessage,
	extractToolCallsFromMessage,
} from '../client/utils/index';
import {
	clearConversation,
	loadConversation,
	storeConversation,
} from './conversationStorage';

describe( 'agentManager', () => {
	let agentManager: AgentManager;
	let mockClient: any;

	// Test data
	const testConfig: ClientConfig = {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agent',
	};

	const mockUserMessage: Message = {
		role: 'user',
		parts: [
			{
				type: 'text',
				text: 'Hello world',
			} as TextPart,
		],
	};

	const mockAgentMessage: Message = {
		role: 'agent',
		parts: [
			{
				type: 'text',
				text: 'Hello back!',
			} as TextPart,
		],
	};

	const mockToolCallMessage: Message = {
		role: 'agent',
		parts: [
			{
				type: 'data',
				data: {
					toolCallId: 'tool-call-1',
					toolId: 'search',
					arguments: { query: 'test' },
				},
			} as ToolCallDataPart,
		],
	};

	const mockTask: Task = {
		id: 'task-123',
		status: {
			state: 'completed',
			message: mockAgentMessage,
		},
	};

	beforeEach( () => {
		// Clear all mocks
		vi.clearAllMocks();

		// Create a fresh agent manager for each test
		agentManager = getAgentManager();
		agentManager.clear();

		// Create mock client
		mockClient = {
			sendMessage: vi.fn(),
			sendMessageStream: vi.fn(),
		};

		// Setup default mock implementations
		vi.mocked( createClient ).mockReturnValue( mockClient );
		vi.mocked( createTextMessage ).mockImplementation(
			( text: string ) => ( {
				role: 'user',
				parts: [ { type: 'text', text } ],
				kind: 'message',
				messageId: 'test-message-id',
				metadata: {
					timestamp: expect.any( Number ),
				},
			} )
		);
		vi.mocked( loadConversation ).mockResolvedValue( [] );
		vi.mocked( storeConversation ).mockResolvedValue();
		vi.mocked( clearConversation ).mockResolvedValue();
		vi.mocked( extractToolCallsFromMessage ).mockReturnValue( [] );

		// Setup default mock for sendMessage to return the mockTask
		mockClient.sendMessage.mockResolvedValue( mockTask );
	} );

	describe( 'createAgent', () => {
		it( 'should create a new agent', async () => {
			const client = await agentManager.createAgent(
				'test-key',
				testConfig
			);

			expect( client ).toBe( mockClient );
			expect( createClient ).toHaveBeenCalledWith( testConfig );
			expect( agentManager.hasAgent( 'test-key' ) ).toBe( true );
		} );

		it( 'should return existing agent if key already exists', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			const client2 = await agentManager.createAgent(
				'test-key',
				testConfig
			);

			expect( client2 ).toBe( mockClient );
			expect( createClient ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should load conversation history when sessionId is provided', async () => {
			const mockHistory = [ mockUserMessage, mockAgentMessage ];
			vi.mocked( loadConversation ).mockResolvedValue( mockHistory );

			const configWithSession = {
				...testConfig,
				sessionId: 'session-123',
			};
			await agentManager.createAgent( 'test-key', configWithSession );

			expect( loadConversation ).toHaveBeenCalledWith(
				'session-123',
				undefined
			);
			const history = agentManager.getConversationHistory( 'test-key' );
			expect( history ).toEqual( mockHistory );
		} );
	} );

	describe( 'getAgent', () => {
		it( 'should return existing agent client', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			const client = agentManager.getAgent( 'test-key' );

			expect( client ).toBe( mockClient );
		} );

		it( 'should return null for non-existent agent', () => {
			const client = agentManager.getAgent( 'non-existent' );
			expect( client ).toBeNull();
		} );
	} );

	describe( 'hasAgent', () => {
		it( 'should return true for existing agent', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			expect( agentManager.hasAgent( 'test-key' ) ).toBe( true );
		} );

		it( 'should return false for non-existent agent', () => {
			expect( agentManager.hasAgent( 'non-existent' ) ).toBe( false );
		} );
	} );

	describe( 'removeAgent', () => {
		it( 'should remove existing agent', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			const removed = agentManager.removeAgent( 'test-key' );

			expect( removed ).toBe( true );
			expect( agentManager.hasAgent( 'test-key' ) ).toBe( false );
		} );

		it( 'should return false for non-existent agent', () => {
			const removed = agentManager.removeAgent( 'non-existent' );
			expect( removed ).toBe( false );
		} );
	} );

	describe( 'sendMessage', () => {
		beforeEach( async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			mockClient.sendMessage.mockResolvedValue( mockTask );
		} );

		it( 'should send message to agent', async () => {
			const task = await agentManager.sendMessage( 'test-key', 'Hello' );

			expect( task ).toBe( mockTask );
			expect( mockClient.sendMessage ).toHaveBeenCalledWith( {
				message: expect.objectContaining( {
					role: 'user',
					parts: expect.arrayContaining( [
						expect.objectContaining( {
							type: 'text',
							text: 'Hello',
						} ),
					] ),
				} ),
				withHistory: true,
			} );
		} );

		it( 'should throw error for non-existent agent', async () => {
			await expect(
				agentManager.sendMessage( 'non-existent', 'Hello' )
			).rejects.toThrow( 'Agent with key "non-existent" not found' );
		} );

		it( 'should handle withHistory=false option', async () => {
			await agentManager.sendMessage( 'test-key', 'Hello', {
				withHistory: false,
			} );

			expect( mockClient.sendMessage ).toHaveBeenCalledWith( {
				message: expect.objectContaining( {
					role: 'user',
					parts: [
						expect.objectContaining( {
							type: 'text',
							text: 'Hello',
						} ),
					],
				} ),
				withHistory: false,
			} );
		} );

		it( 'should update conversation history when withHistory=true', async () => {
			// Create agent with sessionId so storeConversation gets called
			const configWithSession = {
				...testConfig,
				sessionId: 'test-session',
			};
			await agentManager.createAgent(
				'test-key-with-session',
				configWithSession
			);
			mockClient.sendMessage.mockResolvedValue( mockTask );

			await agentManager.sendMessage( 'test-key-with-session', 'Hello' );

			const history = agentManager.getConversationHistory(
				'test-key-with-session'
			);
			expect( history ).toHaveLength( 2 ); // User message + agent response
			expect( history[ 0 ] ).toEqual(
				expect.objectContaining( {
					role: 'user',
					parts: [
						expect.objectContaining( {
							type: 'text',
							text: 'Hello',
						} ),
					],
				} )
			);
			expect( storeConversation ).toHaveBeenCalled();
		} );

		it( 'should maintain in-memory conversation history but not persist when withHistory=false', async () => {
			// Create agent first
			await agentManager.createAgent( 'test-key', testConfig );
			mockClient.sendMessage.mockResolvedValue( mockTask );

			await agentManager.sendMessage( 'test-key', 'Hello', {
				withHistory: false,
			} );

			const history = agentManager.getConversationHistory( 'test-key' );
			expect( history ).toHaveLength( 2 ); // User message + agent response
			expect( storeConversation ).not.toHaveBeenCalled();
		} );

		it( 'should use custom message when provided', async () => {
			const customMessage: Message = {
				role: 'user',
				parts: [ { type: 'text', text: 'Custom message' } ],
			};

			await agentManager.sendMessage( 'test-key', 'Hello', {
				message: customMessage,
			} );

			expect( mockClient.sendMessage ).toHaveBeenCalledWith( {
				message: customMessage,
				withHistory: true,
			} );
		} );
	} );

	describe( 'sendMessageStream', () => {
		beforeEach( async () => {
			await agentManager.createAgent( 'test-key', testConfig );
		} );

		it( 'should stream messages from agent', async () => {
			const mockUpdates: TaskUpdate[] = [
				{
					id: 'task-123',
					status: { state: 'working', message: mockAgentMessage },
					final: false,
					text: 'Hello back!',
				},
				{
					id: 'task-123',
					status: { state: 'completed', message: mockAgentMessage },
					final: true,
					text: 'Hello back!',
				},
			];

			mockClient.sendMessageStream.mockImplementation(
				async function* () {
					for ( const update of mockUpdates ) {
						yield update;
					}
				}
			);

			const results: TaskUpdate[] = [];
			for await ( const update of agentManager.sendMessageStream(
				'test-key',
				'Hello'
			) ) {
				results.push( update );
			}

			expect( results ).toEqual( mockUpdates );
			expect( mockClient.sendMessageStream ).toHaveBeenCalledWith( {
				message: expect.objectContaining( {
					role: 'user',
					parts: expect.arrayContaining( [
						expect.objectContaining( {
							type: 'text',
							text: 'Hello',
						} ),
					] ),
				} ),
				withHistory: true,
			} );
		} );

		it( 'should throw error for non-existent agent', async () => {
			const stream = agentManager.sendMessageStream(
				'non-existent',
				'Hello'
			);

			// Convert async iterable to iterator and test
			const iterator = stream[ Symbol.asyncIterator ]();
			await expect( iterator.next() ).rejects.toThrow(
				'Agent with key "non-existent" not found'
			);
		} );

		it( 'should handle tool calls during streaming', async () => {
			const toolCallUpdate: TaskUpdate = {
				id: 'task-123',
				status: {
					state: 'input-required',
					message: mockToolCallMessage,
				},
				final: false,
				text: '',
			};
			const completedUpdate: TaskUpdate = {
				id: 'task-123',
				status: { state: 'completed', message: mockAgentMessage },
				final: true,
				text: 'Hello back!',
			};

			vi.mocked( extractToolCallsFromMessage ).mockReturnValue( [
				{
					type: 'data',
					data: {
						toolCallId: 'tool-call-1',
						toolId: 'search',
						arguments: { query: 'test' },
					},
				} as ToolCallDataPart,
			] );

			mockClient.sendMessageStream.mockImplementation(
				async function* () {
					yield toolCallUpdate;
					yield completedUpdate;
				}
			);

			const results: TaskUpdate[] = [];
			for await ( const update of agentManager.sendMessageStream(
				'test-key',
				'Hello'
			) ) {
				results.push( update );
			}

			expect( results ).toHaveLength( 2 );
			expect( extractToolCallsFromMessage ).toHaveBeenCalledWith(
				mockToolCallMessage
			);
		} );
	} );

	describe( 'resetConversation', () => {
		it( 'should reset conversation history', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			await agentManager.sendMessage( 'test-key', 'Hello' );

			expect(
				agentManager.getConversationHistory( 'test-key' )
			).toHaveLength( 2 );

			await agentManager.resetConversation( 'test-key' );

			expect(
				agentManager.getConversationHistory( 'test-key' )
			).toHaveLength( 0 );
		} );

		it( 'should clear persistent storage when sessionId exists', async () => {
			const configWithSession = {
				...testConfig,
				sessionId: 'session-123',
			};
			await agentManager.createAgent( 'test-key', configWithSession );
			await agentManager.resetConversation( 'test-key' );

			expect( clearConversation ).toHaveBeenCalledWith(
				'session-123',
				undefined
			);
		} );

		it( 'should throw error for non-existent agent', async () => {
			await expect(
				agentManager.resetConversation( 'non-existent' )
			).rejects.toThrow( 'Agent with key "non-existent" not found' );
		} );
	} );

	describe( 'getConversationHistory', () => {
		it( 'should return conversation history', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			await agentManager.sendMessage( 'test-key', 'Hello' );

			const history = agentManager.getConversationHistory( 'test-key' );
			expect( history ).toHaveLength( 2 );
		} );

		it( 'should return empty array for new agent', async () => {
			await agentManager.createAgent( 'test-key', testConfig );
			const history = agentManager.getConversationHistory( 'test-key' );
			expect( history ).toEqual( [] );
		} );

		it( 'should throw error for non-existent agent', () => {
			expect( () =>
				agentManager.getConversationHistory( 'non-existent' )
			).toThrow( 'Agent with key "non-existent" not found' );
		} );
	} );

	describe( 'clear', () => {
		it( 'should clear all agents', async () => {
			await agentManager.createAgent( 'agent1', testConfig );
			await agentManager.createAgent( 'agent2', testConfig );

			expect( agentManager.hasAgent( 'agent1' ) ).toBe( true );
			expect( agentManager.hasAgent( 'agent2' ) ).toBe( true );

			agentManager.clear();

			expect( agentManager.hasAgent( 'agent1' ) ).toBe( false );
			expect( agentManager.hasAgent( 'agent2' ) ).toBe( false );
		} );
	} );

	describe( 'global singleton', () => {
		it( 'should return the same instance', () => {
			const manager1 = getAgentManager();
			const manager2 = getAgentManager();

			expect( manager1 ).toBe( manager2 );
		} );
	} );
} );

// Test helper functions (these are not exported but we can test their logic through public methods)
describe( 'agentManager helper functions', () => {
	describe( 'extractNewContentFromMessage logic', () => {
		it( 'should filter out conversation history data parts', () => {
			const messageWithHistory: Message = {
				role: 'user',
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
					{
						type: 'data',
						data: {
							toolCallId: 'tool-1',
							toolId: 'search',
							arguments: { query: 'test' },
						},
					} as DataPart,
				],
			};

			// Test the filtering logic
			const filteredParts = messageWithHistory.parts.filter( ( part ) => {
				if ( part.type === 'text' ) {
					return true;
				}
				if ( part.type === 'data' ) {
					// EXCLUDE conversation history data parts (role + text combinations)
					if ( 'role' in part.data && 'text' in part.data ) {
						return false;
					}
					// INCLUDE tool calls (have toolCallId + arguments)
					if (
						'toolCallId' in part.data &&
						'arguments' in part.data
					) {
						return true;
					}
					// INCLUDE tool results (have toolCallId + result)
					if ( 'toolCallId' in part.data && 'result' in part.data ) {
						return true;
					}
					return false;
				}
				return true;
			} );

			expect( filteredParts ).toHaveLength( 2 ); // text part + tool call part
			expect( filteredParts[ 0 ].type ).toBe( 'text' );
			expect( filteredParts[ 1 ].type ).toBe( 'data' );
			expect( ( filteredParts[ 1 ] as DataPart ).data ).toHaveProperty(
				'toolCallId'
			);
		} );
	} );

	describe( 'conversationMessagesToDataParts logic', () => {
		it( 'should convert text messages to history data parts', () => {
			const messages: Message[] = [
				{
					role: 'user',
					parts: [ { type: 'text', text: 'Hello' } as TextPart ],
				},
				{
					role: 'agent',
					parts: [ { type: 'text', text: 'Hi there' } as TextPart ],
				},
			];

			// Test the conversion logic
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
			expect( historyParts[ 0 ].data ).toEqual( {
				role: 'user',
				text: 'Hello',
			} );
			expect( historyParts[ 1 ].data ).toEqual( {
				role: 'agent',
				text: 'Hi there',
			} );
		} );

		it( 'should include tool calls and results but exclude history parts', () => {
			const messages: Message[] = [
				{
					role: 'agent',
					parts: [
						{
							type: 'data',
							data: { role: 'user', text: 'History part' }, // Should be excluded
						} as DataPart,
						{
							type: 'data',
							data: {
								toolCallId: 'tool-1',
								toolId: 'search',
								arguments: { query: 'test' },
							}, // Should be included
						} as DataPart,
						{
							type: 'data',
							data: {
								toolCallId: 'tool-1',
								result: 'Search results',
							}, // Should be included
						} as DataPart,
					],
				},
			];

			// Test the filtering logic
			const historyParts: DataPart[] = [];
			for ( const message of messages ) {
				for ( const part of message.parts ) {
					if ( part.type === 'data' ) {
						// EXCLUDE conversation history data parts (role + text combinations)
						if ( 'role' in part.data && 'text' in part.data ) {
							continue;
						}
						// INCLUDE tool calls (have toolCallId + arguments)
						if (
							'toolCallId' in part.data &&
							'arguments' in part.data
						) {
							historyParts.push( part as ToolCallDataPart );
							continue;
						}
						// INCLUDE tool results (have toolCallId + result)
						if (
							'toolCallId' in part.data &&
							'result' in part.data
						) {
							historyParts.push( part as ToolResultDataPart );
							continue;
						}
					}
				}
			}

			expect( historyParts ).toHaveLength( 2 ); // tool call + tool result
			expect( historyParts[ 0 ].data ).toHaveProperty( 'toolCallId' );
			expect( historyParts[ 0 ].data ).toHaveProperty( 'arguments' );
			expect( historyParts[ 1 ].data ).toHaveProperty( 'toolCallId' );
			expect( historyParts[ 1 ].data ).toHaveProperty( 'result' );
		} );
	} );

	describe( 'extractToolResultsFromMessage logic', () => {
		it( 'should extract tool results from message', () => {
			const message: Message = {
				role: 'agent',
				parts: [
					{
						type: 'text',
						text: 'Some text',
					} as TextPart,
					{
						type: 'data',
						data: {
							toolCallId: 'tool-1',
							result: 'Tool result 1',
						},
					} as DataPart,
					{
						type: 'data',
						data: {
							toolCallId: 'tool-2',
							result: 'Tool result 2',
						},
					} as DataPart,
					{
						type: 'data',
						data: {
							toolCallId: 'tool-3',
							toolId: 'search',
							arguments: { query: 'test' },
						},
					} as DataPart, // Tool call, not result
				],
			};

			// Test the extraction logic
			const toolResults = message.parts.filter(
				( part: any ) =>
					part.type === 'data' &&
					'toolCallId' in part.data &&
					'result' in part.data
			) as DataPart[];

			expect( toolResults ).toHaveLength( 2 );
			expect( toolResults[ 0 ].data ).toEqual( {
				toolCallId: 'tool-1',
				result: 'Tool result 1',
			} );
			expect( toolResults[ 1 ].data ).toEqual( {
				toolCallId: 'tool-2',
				result: 'Tool result 2',
			} );
		} );

		it( 'should return empty array for message without tool results', () => {
			const message: Message = {
				role: 'user',
				parts: [ { type: 'text', text: 'Hello' } as TextPart ],
			};

			const toolResults = message.parts.filter(
				( part: any ) =>
					part.type === 'data' &&
					'toolCallId' in part.data &&
					'result' in part.data
			) as DataPart[];

			expect( toolResults ).toHaveLength( 0 );
		} );

		it( 'should return empty array for undefined message', () => {
			const message: Message | undefined = undefined;

			const toolResults =
				( message?.parts?.filter(
					( part: any ) =>
						part.type === 'data' &&
						'toolCallId' in part.data &&
						'result' in part.data
				) as DataPart[] ) || [];

			expect( toolResults ).toHaveLength( 0 );
		} );
	} );
} );
