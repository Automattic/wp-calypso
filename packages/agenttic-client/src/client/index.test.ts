import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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
				const stream = new ReadableStream({
					start(controller) {
						const encoder = new TextEncoder();
						
						// Send the completion event
						const completionEvent = JSON.stringify({
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
												text: 'Task completed!'
											}
										]
									},
									final: true
								}
							}
						});
						
						const sseData = `data: ${completionEvent}\n\n`;
						controller.enqueue(encoder.encode(sseData));
						
						// Close the stream after sending the data
						setTimeout(() => {
							controller.close();
						}, 10);
					}
				});
				return stream;
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({
					'content-type': 'text/event-stream'
				}),
				body: createFollowUpSSEStream()
			});

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
				const stream = new ReadableStream({
					start(controller) {
						const encoder = new TextEncoder();
						
						// Send the completion event
						const completionEvent = JSON.stringify({
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
												text: 'Task completed!'
											}
										]
									},
									final: true
								}
							}
						});
						
						const sseData = `data: ${completionEvent}\n\n`;
						controller.enqueue(encoder.encode(sseData));
						
						// Close the stream after sending the data
						setTimeout(() => {
							controller.close();
						}, 10);
					}
				});
				return stream;
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({
					'content-type': 'text/event-stream'
				}),
				body: createFollowUpSSEStream()
			});

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
				const stream = new ReadableStream({
					start(controller) {
						const encoder = new TextEncoder();
						
						const secondEvent = JSON.stringify({
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
												text: 'I need to use another tool'
											},
											{
												type: 'data',
												data: {
													toolCallId: 'call-second',
													toolId: 'test-tool',
													arguments: { input: 'second input' }
												}
											}
										]
									},
									final: true
								}
							}
						});
						
						const sseData = `data: ${secondEvent}\n\n`;
						controller.enqueue(encoder.encode(sseData));
						
						setTimeout(() => {
							controller.close();
						}, 10);
					}
				});
				return stream;
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({
					'content-type': 'text/event-stream'
				}),
				body: createSecondSSEStream()
			});

			// Mock the third fetch call (final completion) - now streaming
			const createThirdSSEStream = () => {
				const stream = new ReadableStream({
					start(controller) {
						const encoder = new TextEncoder();
						
						const finalEvent = JSON.stringify({
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
												text: 'All tasks completed!'
											}
										]
									},
									final: true
								}
							}
						});
						
						const sseData = `data: ${finalEvent}\n\n`;
						controller.enqueue(encoder.encode(sseData));
						
						setTimeout(() => {
							controller.close();
						}, 10);
					}
				});
				return stream;
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({
					'content-type': 'text/event-stream'
				}),
				body: createThirdSSEStream()
			});

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
} );
