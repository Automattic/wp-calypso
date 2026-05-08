import { describe, expect, it } from 'vitest';
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
} );
