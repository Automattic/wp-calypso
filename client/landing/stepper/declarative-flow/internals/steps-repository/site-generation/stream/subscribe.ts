import { applyEnvelope, initialStreamState, stateFromSnapshot } from './reducer';
import { readSseStream, SseParser } from './sse';
import { parseEnvelope, parseSnapshot } from './types';
import type { BuildWowStreamState } from './reducer';
import type { BuildWowStreamInfo } from './types';

// Follows one run's feed: a snapshot first, then finite event responses, each
// resumed from the last applied cursor. An expired cursor or a gap in the
// sequence rebuilds from a fresh snapshot. A superseded run, a missing feed,
// a repeated failure, or the end of generation stops the feed and leaves the
// screen on status polling, which keeps running throughout. Nothing here can
// start, retry, or cancel the build.

export type BuildWowStreamStopReason = 'superseded' | 'unauthorized' | 'unavailable';

type Authorize = () => Promise< string | null >;

const MAX_CONSECUTIVE_FAILURES = 6;
const MAX_BACKOFF_MS = 30000;
const ACTIVE_RECONNECT_MS = 250;
const IDLE_RECONNECT_MS = [ 1000, 2000, 4000, 5000 ];
// The server ends each response on its own; this only guards a stalled one.
const CONNECTION_TIMEOUT_MS = 90000;

class StreamStop extends Error {
	constructor( readonly reason: BuildWowStreamStopReason ) {
		super( reason );
	}
}

class ResyncNeeded extends Error {}

// The host's WP_Error code, when the body has one.
async function errorCode( response: Response ): Promise< string | null > {
	try {
		const body = await response.json();
		return typeof body?.code === 'string' ? body.code : null;
	} catch {
		return null;
	}
}

function wait( ms: number, signal: AbortSignal ): Promise< void > {
	return new Promise( ( resolve ) => {
		const timeout = setTimeout( resolve, ms );
		signal.addEventListener(
			'abort',
			() => {
				clearTimeout( timeout );
				resolve();
			},
			{ once: true }
		);
	} );
}

function backoff( failures: number ): number {
	const ceiling = Math.min( MAX_BACKOFF_MS, 1000 * 2 ** failures );
	return Math.round( ceiling / 2 + ( Math.random() * ceiling ) / 2 );
}

export function subscribeToBuildWowStream( {
	info,
	authorize,
	onState,
	onStop,
	fetchImpl = ( ...args ) => window.fetch( ...args ),
}: {
	info: BuildWowStreamInfo;
	authorize: Authorize;
	onState: ( state: BuildWowStreamState ) => void;
	onStop?: ( reason: BuildWowStreamStopReason ) => void;
	fetchImpl?: typeof fetch;
} ): () => void {
	const lifetime = new AbortController();
	let state = initialStreamState( info.runId );
	let needsSnapshot = true;
	// Set by a snapshot until an event lands after it, so a feed that keeps
	// asking for a resync straight after one counts as failing.
	let isSnapshotUnproven = false;
	let retryMs = 0;
	let failures = 0;
	let idleConnections = 0;
	let rejectedAuth = false;

	// One connection, body included: the timeout and teardown abort cover
	// reading the response, not just waiting for its headers.
	const withConnection = async < T >(
		operation: ( signal: AbortSignal ) => Promise< T >
	): Promise< T > => {
		const connection = new AbortController();
		const abort = () => connection.abort();
		lifetime.signal.addEventListener( 'abort', abort, { once: true } );
		const timeout = setTimeout( abort, CONNECTION_TIMEOUT_MS );
		try {
			return await operation( connection.signal );
		} finally {
			clearTimeout( timeout );
			lifetime.signal.removeEventListener( 'abort', abort );
		}
	};

	const request = async (
		url: string,
		accept: string,
		signal: AbortSignal
	): Promise< Response > => {
		const authorization = await authorize();
		if ( ! authorization ) {
			throw new StreamStop( 'unauthorized' );
		}
		const response = await fetchImpl( url, {
			method: 'GET',
			headers: { Accept: accept, Authorization: authorization },
			credentials: 'omit',
			cache: 'no-store',
			signal,
		} );
		if ( response.status === 401 || response.status === 403 ) {
			// One more try with whatever the provider hands out now, in case the
			// token expired between minting and use.
			if ( rejectedAuth ) {
				throw new StreamStop( 'unauthorized' );
			}
			rejectedAuth = true;
			throw new Error( `HTTP ${ response.status }` );
		}
		rejectedAuth = false;
		return response;
	};

	const loadSnapshot = async ( signal: AbortSignal ) => {
		const response = await request( info.snapshotUrl, 'application/json', signal );
		if ( response.status === 404 ) {
			throw new StreamStop( 'unavailable' );
		}
		if ( response.status === 409 || response.status === 410 ) {
			throw new StreamStop( 'superseded' );
		}
		if ( ! response.ok ) {
			throw new Error( `HTTP ${ response.status }` );
		}
		const snapshot = parseSnapshot( await response.json() );
		if ( ! snapshot ) {
			throw new StreamStop( 'unavailable' );
		}
		if ( snapshot.runId !== info.runId ) {
			throw new StreamStop( 'superseded' );
		}
		state = stateFromSnapshot( info.runId, snapshot.cursor, snapshot.state );
		isSnapshotUnproven = true;
		needsSnapshot = false;
		onState( state );
	};

	// Resolves with the number of events applied from one finite response.
	const readEvents = async ( signal: AbortSignal ): Promise< number > => {
		const url = new URL( info.eventsUrl );
		url.searchParams.set( 'after', String( state.cursor ) );
		const response = await request( url.href, 'text/event-stream', signal );
		if ( response.status === 409 ) {
			// stream_cursor_expired asks for a fresh snapshot; any other conflict,
			// stream_run_superseded included, means this run is no longer the build.
			if ( ( await errorCode( response ) ) === 'stream_cursor_expired' ) {
				throw new ResyncNeeded();
			}
			throw new StreamStop( 'superseded' );
		}
		if ( response.status === 404 ) {
			throw new StreamStop( 'unavailable' );
		}
		if ( response.status === 410 ) {
			throw new StreamStop( 'superseded' );
		}
		const contentType = response.headers.get( 'Content-Type' ) ?? '';
		if ( ! response.ok || ! response.body || ! contentType.startsWith( 'text/event-stream' ) ) {
			throw new Error( `HTTP ${ response.status } ${ contentType }` );
		}

		let applied = 0;
		const parser = new SseParser();
		await readSseStream(
			response.body,
			( frame ) => {
				let raw: unknown;
				try {
					raw = JSON.parse( frame.data );
				} catch {
					return;
				}
				const envelope = parseEnvelope( raw );
				if ( ! envelope ) {
					return;
				}
				if ( envelope.runId !== info.runId ) {
					throw new StreamStop( 'superseded' );
				}
				if ( envelope.seq <= state.cursor ) {
					return;
				}
				// The response starts strictly after the cursor it was asked for, so
				// anything but the next number means events went missing.
				if ( envelope.seq !== state.cursor + 1 ) {
					throw new ResyncNeeded();
				}
				isSnapshotUnproven = false;
				state = applyEnvelope( state, envelope );
				applied++;
				onState( state );
			},
			parser
		);
		retryMs = parser.retryMs ?? retryMs;
		return applied;
	};

	const run = async () => {
		while ( ! lifetime.signal.aborted ) {
			let delay = 0;
			try {
				if ( needsSnapshot ) {
					await withConnection( loadSnapshot );
				} else {
					const applied = await withConnection( readEvents );
					idleConnections = applied > 0 ? 0 : idleConnections + 1;
					delay =
						applied > 0
							? ACTIVE_RECONNECT_MS
							: IDLE_RECONNECT_MS[ Math.min( idleConnections, IDLE_RECONNECT_MS.length ) - 1 ];
					delay = Math.max( delay, retryMs );
					failures = 0;
				}
				// Generation is over; nothing more will arrive, and status polling
				// takes the screen the rest of the way.
				if ( state.engineTerminal ) {
					lifetime.abort();
					return;
				}
			} catch ( error ) {
				if ( lifetime.signal.aborted ) {
					return;
				}
				if ( error instanceof StreamStop ) {
					lifetime.abort();
					onStop?.( error.reason );
					return;
				}
				if ( error instanceof ResyncNeeded ) {
					if ( isSnapshotUnproven ) {
						failures++;
					}
					needsSnapshot = true;
				} else {
					failures++;
				}
				if ( failures >= MAX_CONSECUTIVE_FAILURES ) {
					lifetime.abort();
					onStop?.( 'unavailable' );
					return;
				}
				delay = failures > 0 ? backoff( failures ) : 0;
			}
			if ( delay > 0 ) {
				await wait( delay, lifetime.signal );
			}
		}
	};

	void run();

	return () => lifetime.abort();
}
