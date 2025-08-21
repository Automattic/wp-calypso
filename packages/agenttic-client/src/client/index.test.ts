import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from './index';
import { createTextMessage } from './utils/index';
import type { ToolProvider } from './types/index';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal( 'fetch', mockFetch );

describe( 'Client', () => {
	beforeEach( () => {
		mockFetch.mockClear();
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'Message ID behavior', () => {
		it( 'should pass message ID to tool execution when message has an ID', async () => {
			// Arrange: Create a mock tool provider that captures the messageId parameter
			let capturedMessageId: string | undefined;
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'test-tool',
							name: 'Test Tool',
							description: 'A test tool',
							input_schema: {
								type: 'object',
								properties: {
									input: { type: 'string' },
								},
							},
						},
					];
				},
				async executeTool(
					toolId: string,
					args: any,
					messageId?: string,
					toolCallId?: string
				) {
					capturedMessageId = messageId;
					return { result: 'tool executed' };
				},
			};

			// Mock SSE stream response for streaming request
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						// Send initial message with tool call
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-123', // This is the message ID that should be passed to the tool
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'I need to use a tool',
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'test-tool',
													arguments: {
														input: 'test input',
													},
												},
											},
										],
									},
								},
							},
						} ) }\n\n`;

						controller.enqueue( encoder.encode( sseData ) );

						// Close the stream after sending the data
						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			// Mock the streaming response
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock the follow-up streaming response after tool execution
			const createFollowUpSSEStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();

						// Send the completion event
						const completionEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-2',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'completed',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'Task completed!',
											},
										],
									},
									final: true,
								},
							},
						} );

						const sseData = `data: ${ completionEvent }\n\n`;
						controller.enqueue( encoder.encode( sseData ) );

						// Close the stream after sending the data
						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createFollowUpSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message and let the client handle tool calls
			const userMessage = createTextMessage( 'Please use the test tool' );

			// Use sendMessageStream to trigger tool execution
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: Verify that the message ID was passed to the tool execution
			expect( capturedMessageId ).toBe( 'message-123' );
		} );

		it( 'should handle tool execution when message has no ID', async () => {
			// Arrange: Create a mock tool provider that captures the messageId parameter
			let capturedMessageId: string | undefined;
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'test-tool',
							name: 'Test Tool',
							description: 'A test tool',
							input_schema: {
								type: 'object',
								properties: {
									input: { type: 'string' },
								},
							},
						},
					];
				},
				async executeTool(
					toolId: string,
					args: any,
					messageId?: string,
					toolCallId?: string
				) {
					capturedMessageId = messageId;
					return { result: 'tool executed' };
				},
			};

			// Mock SSE stream response for streaming request (without message ID)
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						// Send initial message with tool call but no message ID
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										// No id field
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'I need to use a tool',
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'test-tool',
													arguments: {
														input: 'test input',
													},
												},
											},
										],
									},
								},
							},
						} ) }\n\n`;

						controller.enqueue( encoder.encode( sseData ) );

						// Close the stream after sending the data
						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			// Mock the streaming response
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock the follow-up streaming response after tool execution
			const createFollowUpSSEStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();

						// Send the completion event
						const completionEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-2',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'completed',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'Task completed!',
											},
										],
									},
									final: true,
								},
							},
						} );

						const sseData = `data: ${ completionEvent }\n\n`;
						controller.enqueue( encoder.encode( sseData ) );

						// Close the stream after sending the data
						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createFollowUpSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message and let the client handle tool calls
			const userMessage = createTextMessage( 'Please use the test tool' );

			// Use sendMessageStream to trigger tool execution
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: Verify that undefined was passed when no message ID is present
			expect( capturedMessageId ).toBeUndefined();
		} );

		it( 'should pass message ID to tool execution in nested tool call scenarios', async () => {
			// Arrange: Create a mock tool provider that captures messageId from multiple executions
			const capturedMessageIds: ( string | undefined )[] = [];
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'test-tool',
							name: 'Test Tool',
							description: 'A test tool',
							input_schema: {
								type: 'object',
								properties: {
									input: { type: 'string' },
								},
							},
						},
					];
				},
				async executeTool(
					toolId: string,
					args: any,
					messageId?: string,
					toolCallId?: string
				) {
					capturedMessageIds.push( messageId );
					return { result: 'tool executed' };
				},
			};

			// Mock the initial SSE stream response with first tool calls
			const createInitialSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-1',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-first', // First message ID
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'I need to use the first tool',
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-first',
													toolId: 'test-tool',
													arguments: {
														input: 'first input',
													},
												},
											},
										],
									},
								},
							},
						} ) }\n\n`;

						controller.enqueue( encoder.encode( sseData ) );
						setTimeout( () => controller.close(), 10 );
					},
				} );
				return stream;
			};

			// Mock the first fetch call (initial SSE stream)
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( { 'content-type': 'text/event-stream' } ),
				body: createInitialSSEStream(),
			} );

			// Mock the second fetch call (continue task with tool results) - now streaming
			// This response contains MORE tool calls, triggering the nested execution path
			const createSecondSSEStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();

						const secondEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-2',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-second', // Second message ID - this should be passed to nested tool calls
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'I need to use another tool',
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-second',
													toolId: 'test-tool',
													arguments: {
														input: 'second input',
													},
												},
											},
										],
									},
									final: true,
								},
							},
						} );

						const sseData = `data: ${ secondEvent }\n\n`;
						controller.enqueue( encoder.encode( sseData ) );

						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createSecondSSEStream(),
			} );

			// Mock the third fetch call (final completion) - now streaming
			const createThirdSSEStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();

						const finalEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-3',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'completed',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'All tasks completed!',
											},
										],
									},
									final: true,
								},
							},
						} );

						const sseData = `data: ${ finalEvent }\n\n`;
						controller.enqueue( encoder.encode( sseData ) );

						setTimeout( () => {
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createThirdSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message and let the client handle multiple rounds of tool calls
			const userMessage = createTextMessage(
				'Please use tools as needed'
			);

			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: Verify that both message IDs were captured
			// First execution should capture 'message-first' (line ~521 path)
			// Second execution should capture 'message-second' (line ~650 path)
			expect( capturedMessageIds ).toHaveLength( 2 );
			expect( capturedMessageIds[ 0 ] ).toBe( 'message-first' );
			expect( capturedMessageIds[ 1 ] ).toBe( 'message-second' );
		} );
	} );

	describe( 'Running state tool execution', () => {
		it( 'should execute tools immediately in running state without blocking stream', async () => {
			// Arrange: Create a mock tool provider that tracks execution
			const executedTools: Array< {
				toolId: string;
				args: any;
				messageId?: string;
				toolCallId?: string;
			} > = [];
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'set_processing_state',
							name: 'Set Processing State',
							description: 'Sets processing state',
							input_schema: {
								type: 'object',
								properties: {
									clientId: { type: 'string' },
								},
							},
						},
					];
				},
				async executeTool(
					toolId: string,
					args: any,
					messageId?: string,
					toolCallId?: string
				) {
					executedTools.push( {
						toolId,
						args,
						messageId,
						toolCallId,
					} );
					return { result: 'processing state set' };
				},
			};

			// Mock SSE stream response with running state and tool calls
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						// Send running state with tool call
						const runningEvent = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'running',
									message: {
										messageId: 'running-message-123',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId:
														'call-running-123',
													toolId: 'set_processing_state',
													arguments: {
														clientId: 'block-123',
													},
												},
											},
										],
									},
									final: false,
								},
							},
						} ) }\n\n`;

						// Send final completion
						const completedEvent = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id-final',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'completed',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'Task completed successfully!',
											},
										],
									},
									final: true,
								},
							},
						} ) }\n\n`;

						controller.enqueue( encoder.encode( runningEvent ) );
						setTimeout( () => {
							controller.enqueue(
								encoder.encode( completedEvent )
							);
							controller.close();
						}, 10 );
					},
				} );
				return stream;
			};

			// Mock the streaming response
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message and collect all updates
			const userMessage = createTextMessage( 'Start processing' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: Tool should have been executed during running state
			expect( executedTools ).toHaveLength( 1 );
			expect( executedTools[ 0 ] ).toEqual( {
				toolId: 'set_processing_state',
				args: { clientId: 'block-123' },
				messageId: 'running-message-123',
				toolCallId: 'call-running-123',
			} );

			// Should yield both the running state and completion updates
			expect( updates ).toHaveLength( 3 ); // Original running, tool execution marker, completion
			expect( updates[ 0 ].status.state ).toBe( 'running' );
			expect( updates[ 1 ].status.state ).toBe( 'running' ); // Tool execution marker
			expect( updates[ 2 ].status.state ).toBe( 'completed' );
			expect( updates[ 2 ].final ).toBe( true );
		} );

		it( 'should not execute tools in running state when no matching callbacks exist', async () => {
			// Arrange: Create a tool provider that doesn't have the requested tool
			const executedTools: Array< { toolId: string; args: any } > = [];
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'different_tool',
							name: 'Different Tool',
							description: 'A different tool',
							input_schema: { type: 'object', properties: {} },
						},
					];
				},
				async executeTool( toolId: string, args: any ) {
					executedTools.push( { toolId, args } );
					return { result: 'executed' };
				},
			};

			// Mock SSE stream with running state that calls a tool not available in provider
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const runningEvent = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'test-task-id',
								status: {
									state: 'running',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'unavailable_tool', // Tool not in provider
													arguments: { data: 'test' },
												},
											},
										],
									},
									final: true,
								},
							},
						} ) }\n\n`;

						controller.enqueue( encoder.encode( runningEvent ) );
						setTimeout( () => controller.close(), 10 );
					},
				} );
				return stream;
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( { 'content-type': 'text/event-stream' } ),
				body: createMockSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message
			const userMessage = createTextMessage( 'Test message' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: No tools should have been executed since no matching callback exists
			expect( executedTools ).toHaveLength( 0 );
			// Should only have the original running state update
			expect( updates ).toHaveLength( 1 );
			expect( updates[ 0 ].status.state ).toBe( 'running' );
		} );
	} );

	describe( 'SSE error handling', () => {
		it( 'should throw error when SSE event contains error field', async () => {
			const encoder = new TextEncoder();
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( { 'content-type': 'text/event-stream' } ),
				body: new ReadableStream( {
					start( controller ) {
						controller.enqueue(
							encoder.encode(
								`data: {"error":{"message":"API rate limit exceeded"}}\n\n`
							)
						);
						controller.close();
					},
				} ),
			} );

			const client = createClient( { agentId: 'test-agent' } );

			await expect( async () => {
				const stream = client.sendMessageStream( {
					message: createTextMessage( 'Hello' ),
				} );
				for await ( const update of stream ) {
					// Should throw before yielding any updates
				}
			} ).rejects.toThrow( 'Streaming error: API rate limit exceeded' );
		} );
	} );
} );
