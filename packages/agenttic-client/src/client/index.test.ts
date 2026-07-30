import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient, sendMessageAndWait } from './index';
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
		it( 'continues WPCOM final input-required tool call events before resolving', async () => {
			let executedToolCallId: string | undefined;
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'test-tool',
							name: 'Test Tool',
							description: 'A test tool',
							input_schema: {
								type: 'object',
								properties: {},
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
					executedToolCallId = toolCallId;
					return {
						result: { toolId, args, messageId },
						returnToAgent: true,
					};
				},
			};

			const encoder = new TextEncoder();
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: new ReadableStream( {
					start( controller ) {
						const inputRequiredEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'req-wpcom-input',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'task-wpcom-input',
								status: {
									state: 'input-required',
									message: {
										messageId: 'resp-tool-call',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-wpcom',
													toolId: 'test-tool',
													arguments: {
														input: 'from-wpcom',
													},
												},
											},
										],
									},
									final: true,
								},
								sessionId: 'session-wpcom',
							},
						} );

						controller.enqueue(
							encoder.encode(
								`data: ${ inputRequiredEvent }\n\n`
							)
						);
						controller.close();
					},
				} ),
			} );

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: new ReadableStream( {
					start( controller ) {
						const completionEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'req-wpcom-complete',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'task-wpcom-input',
								status: {
									state: 'completed',
									message: {
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'Done after tool call.',
											},
										],
									},
									final: true,
								},
								sessionId: 'session-wpcom',
							},
						} );

						controller.enqueue(
							encoder.encode( `data: ${ completionEvent }\n\n` )
						);
						controller.close();
					},
				} ),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			const result = await sendMessageAndWait( client, {
				message: createTextMessage( 'Please use the test tool' ),
			} );

			expect( executedToolCallId ).toBe( 'call-wpcom' );
			expect( mockFetch ).toHaveBeenCalledTimes( 2 );
			expect( result.final ).toBe( true );
			expect( result.text ).toBe( 'Done after tool call.' );
		} );

		it( 'preserves final input-required events when an advertised tool has no executable handler', async () => {
			const mockToolProvider: ToolProvider = {
				async getAvailableTools() {
					return [
						{
							id: 'available-tool',
							name: 'Available Tool',
							description: 'An available tool',
							input_schema: {
								type: 'object',
								properties: {},
							},
						},
					];
				},
			};

			const encoder = new TextEncoder();
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: new ReadableStream( {
					start( controller ) {
						const inputRequiredEvent = JSON.stringify( {
							jsonrpc: '2.0',
							id: 'req-input',
							result: {
								type: 'TaskStatusUpdateEvent',
								taskId: 'task-input',
								status: {
									state: 'input-required',
									message: {
										messageId: 'resp-unavailable-tool',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId:
														'call-unavailable',
													toolId: 'available-tool',
													arguments: {},
												},
											},
										],
									},
									final: true,
								},
								sessionId: 'session-input',
							},
						} );

						controller.enqueue(
							encoder.encode(
								`data: ${ inputRequiredEvent }\n\n`
							)
						);
						controller.close();
					},
				} ),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			const result = await sendMessageAndWait( client, {
				message: createTextMessage(
					'Request an unavailable client tool'
				),
			} );

			expect( mockFetch ).toHaveBeenCalledTimes( 1 );
			expect( result.final ).toBe( true );
			expect( result.status.state ).toBe( 'input-required' );
		} );

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

	describe( 'File part preservation in conversation history', () => {
		it( 'should preserve file parts in conversation history when continuing after tool execution', async () => {
			// Arrange: Create a mock tool provider with a tool that returns to agent
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
				async executeTool() {
					return {
						result: { success: true },
						returnToAgent: true,
					};
				},
			};

			// Mock SSE stream response - agent requests tool execution
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'agent-message-1',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'text',
												text: 'I will process the image',
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-1',
													toolId: 'set_processing_state',
													arguments: {
														clientId: 'block-123',
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

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock the continuation response (completion after tool result)
			const createContinuationSSEStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();
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
												text: 'Image has been applied!',
											},
										],
									},
									final: true,
								},
							},
						} );
						const sseData = `data: ${ completionEvent }\n\n`;
						controller.enqueue( encoder.encode( sseData ) );
						setTimeout( () => controller.close(), 10 );
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
				body: createContinuationSSEStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act: Send a message that includes a file part (simulating image upload)
			const userMessage = {
				role: 'user' as const,
				kind: 'message' as const,
				messageId: 'user-msg-1',
				parts: [
					{
						type: 'text' as const,
						text: 'Replace the hero with this image',
					},
					{
						type: 'file' as const,
						file: {
							name: 'hero.jpg',
							mimeType: 'image/jpeg',
							uri: 'https://example.com/uploads/hero.jpg',
						},
						metadata: {
							attachmentId: 123,
						},
					},
				],
			};

			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert: The continuation request (second fetch call) should include file parts
			// The second call is the continuation after tool execution
			expect( mockFetch ).toHaveBeenCalledTimes( 2 );

			const continuationCall = mockFetch.mock.calls[ 1 ];
			const continuationBody = JSON.parse( continuationCall[ 1 ].body );
			const continuationParts = continuationBody.params.message.parts;

			// Should contain the file part from the original message in the history
			const fileParts = continuationParts.filter(
				( p: any ) => p.type === 'file'
			);
			expect( fileParts ).toHaveLength( 1 );
			expect( fileParts[ 0 ].file.name ).toBe( 'hero.jpg' );
			expect( fileParts[ 0 ].file.mimeType ).toBe( 'image/jpeg' );
			expect( fileParts[ 0 ].file.uri ).toBe(
				'https://example.com/uploads/hero.jpg'
			);
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

	describe( 'Ability execution', () => {
		it( 'should execute ability callback when exact name matches', async () => {
			let abilityExecuted = false;
			const ability = {
				name: 'test/ability',
				label: 'Test Ability',
				description: 'A test ability',
				category: 'test',
				callback: async ( input: any ) => {
					abilityExecuted = true;
					return { result: 'ability executed', input };
				},
			};

			const mockToolProvider: ToolProvider = {
				async getAbilities() {
					return [ ability ];
				},
				async getAvailableTools() {
					return [];
				},
				async executeTool() {
					throw new Error( 'Should not call executeTool' );
				},
			};

			// Mock SSE stream with ability call using exact name
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-123',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'test/ability', // Exact name
													arguments: {
														value: 'test',
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

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock follow-up response
			const createFollowUpStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();
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
												text: 'Done!',
											},
										],
									},
									final: true,
								},
							},
						} );
						controller.enqueue(
							encoder.encode( `data: ${ completionEvent }\n\n` )
						);
						setTimeout( () => controller.close(), 10 );
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
				body: createFollowUpStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act
			const userMessage = createTextMessage( 'Test' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert
			expect( abilityExecuted ).toBe( true );
		} );

		it( 'should execute ability callback when sanitized name matches', async () => {
			// Arrange: Create ability with slashes and hyphens
			let capturedInput: any;
			const ability = {
				name: 'demo/get-user-info',
				label: 'Get User Info',
				description: 'Gets user information',
				category: 'user',
				callback: async ( input: any ) => {
					capturedInput = input;
					return { name: 'Test User', email: 'test@example.com' };
				},
			};

			const mockToolProvider: ToolProvider = {
				async getAbilities() {
					return [ ability ];
				},
				async getAvailableTools() {
					return [];
				},
				async executeTool() {
					throw new Error( 'Should not call executeTool' );
				},
			};

			// Mock SSE stream with sanitized ability name (demo__get_user_info)
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-123',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'demo__get_user_info', // Sanitized name
													arguments: {
														includePreferences:
															true,
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

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock follow-up response
			const createFollowUpStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();
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
												text: 'Done!',
											},
										],
									},
									final: true,
								},
							},
						} );
						controller.enqueue(
							encoder.encode( `data: ${ completionEvent }\n\n` )
						);
						setTimeout( () => controller.close(), 10 );
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
				body: createFollowUpStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act
			const userMessage = createTextMessage( 'Get user info' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert - ability should have been executed with the right input
			// `enhancedArgs` includes the original arguments plus `messageId`, `toolCallId`, and `toolId`
			expect( capturedInput ).toEqual( {
				includePreferences: true,
				messageId: 'message-123',
				toolCallId: 'call-123',
				toolId: 'demo__get_user_info',
			} );
		} );

		it( 'should fall through to executeTool when no ability matches', async () => {
			// Arrange: Create ability with different name
			const ability = {
				name: 'other/ability',
				label: 'Other Ability',
				description: 'Another ability',
				category: 'test',
				callback: async () => {
					throw new Error( 'Should not execute this ability' );
				},
			};

			let toolExecuted = false;
			const mockToolProvider: ToolProvider = {
				async getAbilities() {
					return [ ability ];
				},
				async getAvailableTools() {
					return [
						{
							id: 'test_tool',
							name: 'Test Tool',
							description: 'A test tool',
							input_schema: {
								type: 'object',
								properties: {},
							},
						},
					];
				},
				async executeTool( toolId: string ) {
					if ( toolId === 'test_tool' ) {
						toolExecuted = true;
						return { result: 'tool executed' };
					}
					throw new Error( `Unknown tool: ${ toolId }` );
				},
			};

			// Mock SSE stream with regular tool call
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-123',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'test_tool', // Different from ability
													arguments: {},
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

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock follow-up response
			const createFollowUpStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();
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
												text: 'Done!',
											},
										],
									},
									final: true,
								},
							},
						} );
						controller.enqueue(
							encoder.encode( `data: ${ completionEvent }\n\n` )
						);
						setTimeout( () => controller.close(), 10 );
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
				body: createFollowUpStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act
			const userMessage = createTextMessage( 'Test' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert - regular tool should have been executed
			expect( toolExecuted ).toBe( true );
		} );

		it( 'should handle errors in ability callbacks gracefully', async () => {
			// Arrange: Create ability that throws error
			const ability = {
				name: 'failing/ability',
				label: 'Failing Ability',
				description: 'An ability that fails',
				category: 'test',
				callback: async () => {
					throw new Error( 'Ability execution failed' );
				},
			};

			const mockToolProvider: ToolProvider = {
				async getAbilities() {
					return [ ability ];
				},
				async getAvailableTools() {
					return [];
				},
				async executeTool() {
					throw new Error( 'Should not call executeTool' );
				},
			};

			// Mock SSE stream with ability call
			const createMockSSEStream = () => {
				const encoder = new TextEncoder();
				const stream = new ReadableStream( {
					start( controller ) {
						const sseData = `data: ${ JSON.stringify( {
							jsonrpc: '2.0',
							id: 'test-request-id',
							result: {
								id: 'test-task-id',
								status: {
									state: 'input-required',
									message: {
										messageId: 'message-123',
										role: 'agent',
										kind: 'message',
										parts: [
											{
												type: 'data',
												data: {
													toolCallId: 'call-123',
													toolId: 'failing__ability',
													arguments: {},
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

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( {
					'content-type': 'text/event-stream',
				} ),
				body: createMockSSEStream(),
			} );

			// Mock follow-up response
			const createFollowUpStream = () => {
				const stream = new ReadableStream( {
					start( controller ) {
						const encoder = new TextEncoder();
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
												text: 'Error handled',
											},
										],
									},
									final: true,
								},
							},
						} );
						controller.enqueue(
							encoder.encode( `data: ${ completionEvent }\n\n` )
						);
						setTimeout( () => controller.close(), 10 );
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
				body: createFollowUpStream(),
			} );

			const client = createClient( {
				agentId: 'test-agent',
				toolProvider: mockToolProvider,
			} );

			// Act - should not throw, error should be handled gracefully
			const userMessage = createTextMessage( 'Test' );
			const updates = [];
			for await ( const update of client.sendMessageStream( {
				message: userMessage,
			} ) ) {
				updates.push( update );
			}

			// Assert - should complete successfully despite ability error
			expect( updates ).toHaveLength( 3 ); // working, tool result, completed
			expect( updates[ 2 ].status.state ).toBe( 'completed' );
		} );
	} );

	describe( 'fetch credentials option', () => {
		const mockJsonRpcResponse = () => {
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				status: 200,
				headers: new Headers( { 'content-type': 'application/json' } ),
				json: async () => ( {
					jsonrpc: '2.0',
					id: 'test-request-id',
					result: {
						id: 'test-task-id',
						status: {
							state: 'completed',
							message: {
								role: 'agent',
								kind: 'message',
								parts: [ { type: 'text', text: 'ok' } ],
								messageId: 'm-1',
							},
						},
					},
				} ),
			} );
		};

		it( 'omits the credentials key from fetch options when not configured', async () => {
			mockJsonRpcResponse();

			const client = createClient( {
				agentId: 'test-agent',
				agentUrl: 'https://example.com/agents',
			} );

			await client.sendMessage( {
				message: createTextMessage( 'hello' ),
			} );

			expect( mockFetch ).toHaveBeenCalledTimes( 1 );
			const fetchOptions = mockFetch.mock.calls[ 0 ][ 1 ];
			expect( fetchOptions ).not.toHaveProperty( 'credentials' );
		} );

		it( "passes credentials: 'include' through to fetch options when configured", async () => {
			mockJsonRpcResponse();

			const client = createClient( {
				agentId: 'test-agent',
				agentUrl: 'https://example.com/agents',
				credentials: 'include',
			} );

			await client.sendMessage( {
				message: createTextMessage( 'hello' ),
			} );

			expect( mockFetch ).toHaveBeenCalledTimes( 1 );
			const fetchOptions = mockFetch.mock.calls[ 0 ][ 1 ];
			expect( fetchOptions.credentials ).toBe( 'include' );
		} );
	} );
} );
