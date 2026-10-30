import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeStreamingRequest } from '../requests';
import type { TaskUpdate } from '../../../types/index';

const encoder = new TextEncoder();

const working = `data: ${ JSON.stringify( {
	jsonrpc: '2.0',
	id: 1,
	result: {
		kind: 'status-update',
		taskId: 'task-1',
		contextId: 'context-1',
		status: { state: 'working' },
		final: false,
	},
} ) }\n\n`;

const final = working.replace( '"working"},"final":false', '"completed"},"final":true' );

const preparedRequest = {
	request: { jsonrpc: '2.0', id: 1, method: 'message/stream', params: {} },
	headers: {},
	fullAgentUrl: 'https://agent.test/agent',
} as unknown as Parameters< typeof executeStreamingRequest >[ 0 ];

// Like a real fetch, the body errors when the request's signal aborts. A browser's
// AbortError is an Error; the test environment's DOMException is not.
function respondWith( events: string[], { close }: { close: boolean } ) {
	vi.stubGlobal(
		'fetch',
		vi.fn( ( _url: string, init: RequestInit ) => {
			const body = new ReadableStream< Uint8Array >( {
				start( controller ) {
					events.forEach( ( event ) => controller.enqueue( encoder.encode( event ) ) );
					if ( close ) {
						controller.close();
					}
					init.signal?.addEventListener( 'abort', () =>
						controller.error(
							Object.assign( new Error( 'The operation was aborted.' ), { name: 'AbortError' } )
						)
					);
				},
			} );
			return Promise.resolve( new Response( body, { status: 200 } ) );
		} )
	);
}

async function collect( onUpdate: () => Promise< void > = async () => {} ) {
	const updates: TaskUpdate[] = [];
	for await ( const update of executeStreamingRequest(
		preparedRequest,
		{},
		{ streamingTimeout: 1000 }
	) ) {
		updates.push( update );
		await onUpdate();
	}
	return updates;
}

describe( 'executeStreamingRequest', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	} );

	it( 'cuts off a stream that goes quiet after its headers, as a timeout', async () => {
		respondWith( [ working ], { close: false } );

		const result = collect().catch( ( error: unknown ) => error );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( await result ).toMatchObject( { name: 'AbortError', timedOut: true } );
	} );

	it( 'stops timing reads once the turn is final', async () => {
		respondWith( [ final ], { close: false } );

		let settled = false;
		const result = collect().finally( () => ( settled = true ) );
		await vi.advanceTimersByTimeAsync( 5000 );

		expect( settled ).toBe( false );
		result.catch( () => {} );
	} );

	it( 'does not count the time spent on an update against the stream', async () => {
		respondWith( [ working, working ], { close: true } );

		const result = collect( () => new Promise( ( resolve ) => setTimeout( resolve, 5000 ) ) );
		await vi.advanceTimersByTimeAsync( 10000 );

		expect( await result ).toHaveLength( 2 );
	} );
} );
