import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseSSEStream } from './streaming';

const encoder = new TextEncoder();

function sseEvent( envelope: unknown ): string {
	return `data: ${ JSON.stringify( envelope ) }\n\n`;
}

function streamFromEvents( events: unknown[] ): ReadableStream< Uint8Array > {
	return new ReadableStream( {
		start( controller ) {
			for ( const event of events ) {
				controller.enqueue( encoder.encode( sseEvent( event ) ) );
			}
			controller.close();
		},
	} );
}

function streamFromRaw( payload: string ): ReadableStream< Uint8Array > {
	return new ReadableStream( {
		start( controller ) {
			controller.enqueue( encoder.encode( payload ) );
			controller.close();
		},
	} );
}

describe( 'parseSSEStream', () => {
	it( 'surfaces live tool-call data parts from tool_argument deltas', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"query":"SEL',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: 'ECT 1"}',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 2 );
		expect( updates[ 0 ] ).toMatchObject( {
			id: 'task-1',
			status: {
				state: 'working',
				message: {
					parts: [
						{
							type: 'data',
							data: {
								toolCallId: 'call-1',
								toolId: 'executeQuery',
								arguments: { _raw: '{"query":"SEL' },
							},
						},
					],
				},
			},
			final: false,
			text: '',
		} );
		expect( updates[ 1 ].status.message?.parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: { query: 'SELECT 1' },
				},
			},
		] );
	} );

	it( 'uses toolCallId as the accumulator key when toolCallIndex is absent', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"table":"orders"}',
						toolCallId: 'call-without-index',
						toolCallName: 'getTableDetails',
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates[ 0 ].status.message?.parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolCallId: 'call-without-index',
					toolId: 'getTableDetails',
					arguments: { table: 'orders' },
				},
			},
		] );
	} );

	it( 'tracks multiple concurrent tool calls by index', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"query":"SEL',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"table":"or',
						toolCallId: 'call-2',
						toolCallName: 'getTableDetails',
						toolCallIndex: 1,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: 'ECT 1"}',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: 'ders"}',
						toolCallId: 'call-2',
						toolCallName: 'getTableDetails',
						toolCallIndex: 1,
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 4 );
		expect( updates[ 3 ].status.message?.parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: { query: 'SELECT 1' },
				},
			},
			{
				type: 'data',
				data: {
					toolCallId: 'call-2',
					toolId: 'getTableDetails',
					arguments: { table: 'orders' },
				},
			},
		] );
	} );

	it( 'discards pre-snapshot accumulator state when a status snapshot arrives', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: 'thinking...',
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"a":1}',
						toolCallId: 'call-stale',
						toolCallName: 'staleCall',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				result: {
					id: 'task-1',
					status: {
						state: 'working',
						message: { role: 'agent', parts: [] },
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: 'fresh start',
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		const sawStaleToolCall = updates.some(
			( u ) =>
				u.status.message?.parts?.some(
					( p: any ) =>
						p.type === 'data' && p.data?.toolCallId === 'call-stale'
				)
		);
		expect( sawStaleToolCall ).toBe( true );

		const lastUpdate = updates[ updates.length - 1 ];
		expect( lastUpdate.text ).toBe( 'fresh start' );
		expect( lastUpdate.status.message?.parts ).toEqual( [
			{ type: 'text', text: 'fresh start' },
		] );
	} );

	it( 'accumulates tool names from tool_name deltas', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_name',
						content: 'execute',
						toolCallId: 'call-1',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_name',
						content: 'Query',
						toolCallId: 'call-1',
						toolCallIndex: 0,
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates[ 1 ].status.message?.parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: {},
				},
			},
		] );
	} );

	it( 'interleaves text and tool-call deltas in a single stream', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: 'Looking up ',
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"query":"SELECT 1"}',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: 'the answer.',
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 3 );

		// After update 0 (text only).
		expect( updates[ 0 ].text ).toBe( 'Looking up ' );
		expect( updates[ 0 ].status.message?.parts ).toEqual( [
			{ type: 'text', text: 'Looking up ' },
		] );

		// After update 1 (tool delta arrived; text must be preserved).
		expect( updates[ 1 ].text ).toBe( 'Looking up ' );
		expect( updates[ 1 ].status.message?.parts ).toEqual( [
			{ type: 'text', text: 'Looking up ' },
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: { query: 'SELECT 1' },
				},
			},
		] );

		// After update 2 (more text appended, tool data still present).
		expect( updates[ 2 ].text ).toBe( 'Looking up the answer.' );
		expect( updates[ 2 ].status.message?.parts ).toEqual( [
			{ type: 'text', text: 'Looking up the answer.' },
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: { query: 'SELECT 1' },
				},
			},
		] );
	} );

	it( 'ignores tool-call deltas when supportDeltas is false', async () => {
		const updates = [];
		// Mix a tool-call delta with a non-delta status envelope so we can
		// distinguish "deltas gated off" from "parser inert" — the status
		// envelope should yield, the tool delta should not.
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_argument',
						content: '{"query":"SELECT 1"}',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
			{
				jsonrpc: '2.0',
				result: {
					id: 'task-1',
					status: {
						state: 'working',
						message: { role: 'agent', parts: [] },
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream ) ) {
			updates.push( update );
		}

		// Only the status envelope yielded; the tool delta was dropped.
		expect( updates ).toHaveLength( 1 );
		expect( updates[ 0 ].status.message?.parts ).toEqual( [] );
		expect( updates[ 0 ].text ).toBe( '' );
	} );

	it( 'prefers toolCallName over streamed tool_name content when both are present', async () => {
		// Pins current precedence: when a delta carries both toolCallName
		// (metadata) and tool_name content, toolCallName wins and the
		// content fragment is discarded. Real servers send one or the
		// other, not both, so this is documenting (not endorsing) the
		// behavior so a future refactor doesn't silently flip it.
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'tool_name',
						content: 'shouldBeIgnored',
						toolCallId: 'call-1',
						toolCallName: 'executeQuery',
						toolCallIndex: 0,
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates[ 0 ].status.message?.parts ).toEqual( [
			{
				type: 'data',
				data: {
					toolCallId: 'call-1',
					toolId: 'executeQuery',
					arguments: {},
				},
			},
		] );
	} );

	it( 'tags delta-derived updates with kind: "delta" and status-envelope updates with kind: "status"', async () => {
		// The reducer in useAgentChat uses `kind` to detect utterance
		// boundaries: every non-final text-bearing status event represents
		// a completed model utterance and should rotate to a fresh streaming
		// bubble. Without distinct kinds the reducer cannot tell deltas
		// apart from status envelopes.
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-1',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: 'Hello',
					},
				},
			},
			{
				jsonrpc: '2.0',
				result: {
					id: 'task-1',
					sessionId: 'session-1',
					status: {
						state: 'working',
						message: {
							role: 'agent',
							parts: [ { type: 'text', text: 'Hello world' } ],
							kind: 'message',
							messageId: 'msg-preamble',
						},
					},
				},
			},
			{
				jsonrpc: '2.0',
				id: 'rpc-1',
				result: {
					id: 'task-1',
					sessionId: 'session-1',
					status: {
						state: 'completed',
						message: {
							role: 'agent',
							parts: [ { type: 'text', text: 'Final answer' } ],
							kind: 'message',
							messageId: 'msg-final',
						},
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream, {
			supportDeltas: true,
		} ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 3 );
		expect( updates[ 0 ].kind ).toBe( 'delta' );
		expect( updates[ 0 ].final ).toBe( false );
		expect( updates[ 1 ].kind ).toBe( 'status' );
		expect( updates[ 1 ].final ).toBe( false );
		expect( updates[ 2 ].kind ).toBe( 'status' );
		expect( updates[ 2 ].final ).toBe( true );
	} );

	it( 'uses taskId from WPCOM TaskStatusUpdateEvent results', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				id: 'req-1',
				result: {
					type: 'TaskStatusUpdateEvent',
					taskId: 'task-wpcom',
					sessionId: 'session-wpcom',
					status: {
						state: 'input-required',
						final: true,
						message: {
							kind: 'message',
							messageId: 'resp-site-title',
							role: 'agent',
							parts: [
								{
									type: 'data',
									data: {
										toolCallId: 'call-site-title',
										toolId: 'wpcom__site_title',
										arguments: {
											title: 'Example Site',
										},
									},
								},
							],
						},
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 1 );
		expect( updates[ 0 ] ).toMatchObject( {
			id: 'task-wpcom',
			sessionId: 'session-wpcom',
			final: true,
			kind: 'status',
			status: {
				state: 'input-required',
				message: {
					parts: [
						{
							type: 'data',
							data: {
								toolId: 'wpcom__site_title',
								arguments: {
									title: 'Example Site',
								},
							},
						},
					],
				},
			},
		} );
	} );

	it( 'flushes a final SSE data line when the stream closes without a blank delimiter', async () => {
		const updates = [];
		const event = {
			jsonrpc: '2.0',
			id: 'req-undelimited',
			result: {
				type: 'TaskStatusUpdateEvent',
				taskId: 'task-undelimited',
				sessionId: 'session-undelimited',
				status: {
					state: 'input-required',
					final: true,
					message: {
						kind: 'message',
						messageId: 'resp-undelimited',
						role: 'agent',
						parts: [
							{
								type: 'data',
								data: {
									toolCallId: 'call-undelimited',
									toolId: 'wpcom__site_title',
									arguments: {
										title: 'Example Site',
									},
								},
							},
						],
					},
				},
			},
		};
		const stream = streamFromRaw( `data: ${ JSON.stringify( event ) }` );

		for await ( const update of parseSSEStream( stream ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 1 );
		expect( updates[ 0 ] ).toMatchObject( {
			id: 'task-undelimited',
			sessionId: 'session-undelimited',
			final: true,
			status: {
				state: 'input-required',
				message: {
					parts: [
						{
							type: 'data',
							data: {
								toolCallId: 'call-undelimited',
								toolId: 'wpcom__site_title',
							},
						},
					],
				},
			},
		} );
	} );

	it( 'parses WPCOM SSE data lines with leading whitespace', async () => {
		const updates = [];
		const event = {
			jsonrpc: '2.0',
			id: 'req-leading-space',
			result: {
				type: 'TaskStatusUpdateEvent',
				taskId: 'task-leading-space',
				sessionId: 'session-leading-space',
				status: {
					state: 'input-required',
					final: true,
					message: {
						kind: 'message',
						messageId: 'resp-leading-space',
						role: 'agent',
						parts: [
							{
								type: 'data',
								data: {
									toolCallId: 'call-leading-space',
									toolId: 'wpcom__site_title',
									arguments: {
										title: 'Example Site',
									},
								},
							},
						],
					},
				},
			},
		};
		const stream = streamFromRaw(
			`  data: ${ JSON.stringify( event ) }\n\n`
		);

		for await ( const update of parseSSEStream( stream ) ) {
			updates.push( update );
		}

		expect( updates ).toHaveLength( 1 );
		expect( updates[ 0 ] ).toMatchObject( {
			id: 'task-leading-space',
			sessionId: 'session-leading-space',
			final: true,
			status: {
				state: 'input-required',
				message: {
					parts: [
						{
							type: 'data',
							data: {
								toolCallId: 'call-leading-space',
								toolId: 'wpcom__site_title',
							},
						},
					],
				},
			},
		} );
	} );

	it( 'emits a complete undelimited SSE data line before the stream closes', async () => {
		const event = {
			jsonrpc: '2.0',
			id: 'req-open-undelimited',
			result: {
				type: 'TaskStatusUpdateEvent',
				taskId: 'task-open-undelimited',
				status: {
					state: 'input-required',
					final: true,
					message: {
						kind: 'message',
						messageId: 'resp-open-undelimited',
						role: 'agent',
						parts: [
							{
								type: 'data',
								data: {
									toolCallId: 'call-open-undelimited',
									toolId: 'wpcom__site_title',
									arguments: {
										title: 'Example Site',
									},
								},
							},
						],
					},
				},
			},
		};
		const stream = new ReadableStream< Uint8Array >( {
			start( controller ) {
				controller.enqueue(
					encoder.encode( `data: ${ JSON.stringify( event ) }` )
				);
			},
		} );

		const iterator = parseSSEStream( stream )[ Symbol.asyncIterator ]();
		const result = await Promise.race( [
			iterator.next(),
			new Promise< 'timeout' >( ( resolve ) =>
				setTimeout( () => resolve( 'timeout' ), 50 )
			),
		] );

		expect( result ).not.toBe( 'timeout' );
		expect( result ).toMatchObject( {
			done: false,
			value: {
				id: 'task-open-undelimited',
				final: true,
				status: {
					state: 'input-required',
				},
			},
		} );

		await iterator.return?.();
	} );

	it( 'honors top-level final on non-terminal status updates', async () => {
		const updates = [];
		const stream = streamFromEvents( [
			{
				jsonrpc: '2.0',
				result: {
					taskId: 'task-final',
					final: true,
					status: {
						state: 'input-required',
						message: {
							kind: 'message',
							messageId: 'resp-final',
							role: 'agent',
							parts: [],
						},
					},
				},
			},
		] );

		for await ( const update of parseSSEStream( stream ) ) {
			updates.push( update );
		}

		expect( updates[ 0 ].id ).toBe( 'task-final' );
		expect( updates[ 0 ].final ).toBe( true );
	} );

	describe( 'delta pacing', () => {
		afterEach( () => {
			vi.unstubAllGlobals();
			vi.restoreAllMocks();
		} );

		function contentDelta( index: number ): unknown {
			return {
				jsonrpc: '2.0',
				method: 'message/delta',
				params: {
					id: 'task-paced',
					delta: {
						type: 'delta',
						deltaType: 'content',
						content: `token-${ index } `,
					},
				},
			};
		}

		function singleChunkStreamOf(
			count: number
		): ReadableStream< Uint8Array > {
			// One network chunk carrying the whole backlog, which is what the
			// client sees when the server finished while events were buffered.
			const payload = Array.from( { length: count }, ( _, index ) =>
				sseEvent( contentDelta( index ) )
			).join( '' );
			return streamFromRaw( payload );
		}

		it( 'drains an already-buffered burst of deltas without pacing each one', async () => {
			const rafSpy = vi.fn( ( callback: FrameRequestCallback ) => {
				return setTimeout(
					() => callback( performance.now() ),
					0
				) as unknown as number;
			} );
			vi.stubGlobal( 'requestAnimationFrame', rafSpy );

			const updates = [];
			for await ( const update of parseSSEStream(
				singleChunkStreamOf( 60 ),
				{ supportDeltas: true }
			) ) {
				updates.push( update );
			}

			expect( updates ).toHaveLength( 60 );
			expect( updates[ 59 ].text ).toContain( 'token-59' );
			// A buffered backlog must not wait one frame per delta; only the
			// occasional yield when the processing budget is exhausted.
			expect( rafSpy.mock.calls.length ).toBeLessThanOrEqual( 5 );
		} );

		it( 'delivers all buffered deltas even when requestAnimationFrame never fires', async () => {
			// Hidden tabs and occluded windows throttle or pause rAF
			// entirely; delivery must not stall behind it.
			vi.stubGlobal( 'requestAnimationFrame', vi.fn() );
			// Make every delta appear to exhaust the processing budget so
			// the pacing path is exercised on each event.
			let fakeNow = 0;
			vi.spyOn( Date, 'now' ).mockImplementation(
				() => ( fakeNow += 20 )
			);

			const updates = [];
			for await ( const update of parseSSEStream(
				singleChunkStreamOf( 5 ),
				{ supportDeltas: true }
			) ) {
				updates.push( update );
			}

			expect( updates ).toHaveLength( 5 );
			expect( updates[ 4 ].text ).toContain( 'token-4' );
		}, 3000 );

		it( 'still yields to a frame between deltas once the processing budget is exceeded', async () => {
			const rafSpy = vi.fn( ( callback: FrameRequestCallback ) => {
				return setTimeout(
					() => callback( performance.now() ),
					0
				) as unknown as number;
			} );
			vi.stubGlobal( 'requestAnimationFrame', rafSpy );
			let fakeNow = 0;
			vi.spyOn( Date, 'now' ).mockImplementation(
				() => ( fakeNow += 20 )
			);

			const updates = [];
			for await ( const update of parseSSEStream(
				singleChunkStreamOf( 5 ),
				{ supportDeltas: true }
			) ) {
				updates.push( update );
			}

			expect( updates ).toHaveLength( 5 );
			expect( rafSpy.mock.calls.length ).toBeGreaterThanOrEqual( 1 );
		} );
	} );
} );
