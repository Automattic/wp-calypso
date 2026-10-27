import config from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';

// Shared polling loop for the build-wow pollers in this directory: fetch with
// a timeout + abort, report request errors (each distinct reason once, up to a
// small cap), hand the response to the consumer, and reschedule until the
// consumer says stop or the caller tears the loop down.

const MAX_REPORTED_ERROR_REASONS = 3;

// Non-terminal callbacks run through this so a throwing consumer cannot escape
// poll() and leave the loop unscheduled, which would stall polling for the rest
// of the generation window.
export function reportSafely( report: () => void ): void {
	try {
		report();
	} catch {}
}

// An aborted proxy request rejects with a DOM Event rather than an Error
// (wpcom-proxy-request passes the abort event straight to the callback), which
// stringifies to a useless "[object Event]".
function describeRequestError( error: unknown ): string {
	if ( error instanceof Error ) {
		return error.message;
	}
	if ( error && typeof error === 'object' && 'message' in error ) {
		return String( ( error as { message: unknown } ).message );
	}
	return String( error );
}

function isLoopbackHostname( hostname: string ): boolean {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		hostname.endsWith( '.localhost' )
	);
}

// A development build follows a build that never reached WordPress.com when
// the URL names a local status server, e.g. ?build_wow_api=http://127.0.0.1:4001/api/calypso.
// The value is read from the URL, so only a loopback http origin is honoured.
export function getBuildWowApiOverride( search = window.location.search ): string | null {
	if ( config( 'env_id' ) !== 'development' ) {
		return null;
	}

	const value = new URLSearchParams( search ).get( 'build_wow_api' );
	if ( ! value ) {
		return null;
	}

	let url: URL;
	try {
		url = new URL( value );
	} catch {
		return null;
	}

	if (
		url.protocol !== 'http:' ||
		! isLoopbackHostname( url.hostname ) ||
		url.username ||
		url.password
	) {
		return null;
	}

	return `${ url.origin }${ url.pathname.replace( /\/$/, '' ) }`;
}

async function fetchFromApiOverride< T >(
	apiBase: string,
	siteIdentifier: string,
	endpoint: string,
	signal: AbortSignal
): Promise< T | null > {
	const response = await fetch(
		`${ apiBase }/sites/${ encodeURIComponent( siteIdentifier ) }/big-sky/${ endpoint }`,
		{ signal, credentials: 'omit' }
	);
	if ( ! response.ok ) {
		throw new Error( `Status request failed with ${ response.status }` );
	}

	return ( await response.json() ) as T | null;
}

export function fetchSiteEndpoint< T >(
	siteIdentifier: string,
	endpoint: string,
	signal: AbortSignal
): Promise< T | null > {
	const apiOverride = getBuildWowApiOverride();
	if ( apiOverride ) {
		return fetchFromApiOverride< T >( apiOverride, siteIdentifier, endpoint, signal );
	}

	return wpcom.req.get( {
		path: `/sites/${ siteIdentifier }/big-sky/${ endpoint }`,
		apiNamespace: 'wpcom/v2',
		signal,
	} ) as Promise< T | null >;
}

export function startPolling< T >( {
	fetch: fetchResponse,
	onResponse,
	onRequestError,
	pollIntervalMs = 3000,
	requestTimeoutMs = 15000,
}: {
	fetch: ( signal: AbortSignal ) => Promise< T >;
	// Runs outside the request try/catch: a throw from a consumer callback ends
	// the loop instead of being mistaken for a request failure and silently
	// rescheduling the poll. Return 'stop' to end polling.
	onResponse: ( response: T ) => 'stop' | void;
	onRequestError?: ( reason: string ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;
	const reportedReasons = new Set< string >();

	const poll = async () => {
		const controller = new AbortController();
		const timeout = setTimeout( () => controller.abort(), requestTimeoutMs );
		requestController = controller;
		requestTimeout = timeout;

		let response: T | undefined;

		try {
			response = await fetchResponse( controller.signal );
		} catch ( error ) {
			// A failed request does not mean the generation failed; keep polling.
			// Nothing is reported once the poller has been stopped: tearing down
			// aborts the in-flight request, and a user navigating away must not
			// look like an outage. Otherwise report each distinct reason once, up
			// to a small cap, so a short interval cannot emit hundreds of entries
			// but a later, more informative error is not hidden behind the first
			// one either.
			if ( isActive ) {
				const reason = controller.signal.aborted
					? `request timed out after ${ requestTimeoutMs }ms`
					: describeRequestError( error );
				if (
					! reportedReasons.has( reason ) &&
					reportedReasons.size < MAX_REPORTED_ERROR_REASONS
				) {
					reportedReasons.add( reason );
					reportSafely( () => onRequestError?.( reason ) );
				}
			}
		} finally {
			clearTimeout( timeout );
			requestController = undefined;
			requestTimeout = undefined;
		}

		if ( ! isActive ) {
			return;
		}

		if ( response !== undefined && onResponse( response ) === 'stop' ) {
			return;
		}

		// onResponse may have torn the loop down (a consumer stopping itself).
		if ( ! isActive ) {
			return;
		}

		pollTimeout = setTimeout( () => {
			void poll().catch( () => {} );
		}, pollIntervalMs );
	};

	void poll().catch( () => {} );

	return () => {
		isActive = false;
		if ( pollTimeout !== undefined ) {
			clearTimeout( pollTimeout );
		}
		requestController?.abort();
		if ( requestTimeout !== undefined ) {
			clearTimeout( requestTimeout );
		}
	};
}
