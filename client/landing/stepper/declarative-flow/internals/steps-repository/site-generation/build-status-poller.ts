import wpcom from 'calypso/lib/wp';

// The build-wow backend records progress in the `big_sky_build_wow_build_status`
// blog option, walked through by big_sky_build_wow_activate_and_verify():
//
//   delivering → activating → verifying → live
//                                   ↘ failed:<error_code>
//
// The GET /wpcom/v2/sites/{id}/big-sky/build-wow/status endpoint exposes it so
// the client can react to real progress instead of polling a signal that is
// never written. See big-sky.php.
const BUILD_WOW_LIVE_STATUS = 'live';
const BUILD_WOW_FAILED_STATUS_PREFIX = 'failed:';

export const BUILD_WOW_DELIVERY_PHASES = [ 'delivering', 'activating', 'verifying' ] as const;

const MAX_REPORTED_ERROR_REASONS = 3;
const MAX_ERROR_REASON_LENGTH = 300;

// Maps a delivery phase onto the tail of the designed step list, so a build that
// is already `delivering` when this screen loads does not jump straight to the
// last step. Returns null for a status outside the known walk.
export function getStepIndexForStatus( status: string, stepCount: number ): number | null {
	const phase = ( BUILD_WOW_DELIVERY_PHASES as readonly string[] ).indexOf( status );
	if ( phase === -1 || stepCount === 0 ) {
		return null;
	}
	const firstDeliveryStep = Math.max( 0, stepCount - BUILD_WOW_DELIVERY_PHASES.length );
	return Math.min( stepCount - 1, firstDeliveryStep + phase );
}

function isBuildWowFailedStatus( status: string ): boolean {
	return status.startsWith( BUILD_WOW_FAILED_STATUS_PREFIX );
}

// Non-terminal callbacks run through this so a throwing consumer cannot escape
// poll() and leave the loop unscheduled, which would stall polling for the rest
// of the generation window.
function reportSafely( report: () => void ): void {
	try {
		report();
	} catch {}
}

// An aborted proxy request rejects with a DOM Event rather than an Error
// (wpcom-proxy-request hands the abort event straight to the callback), and an
// Event has no `message`, so it would otherwise stringify to "[object Event]".
function isAbortLike( error: unknown ): boolean {
	if ( typeof Event !== 'undefined' && error instanceof Event ) {
		return true;
	}
	if ( ! error || typeof error !== 'object' ) {
		return false;
	}
	const { name, type } = error as { name?: unknown; type?: unknown };
	return name === 'AbortError' || type === 'abort';
}

// Failures arrive as WPError, which extends Error and carries the HTTP status
// separately from the message — and whose message the response body can
// overwrite, so two different statuses can share one string. The status is kept
// in the reason so those stay distinguishable, both in the log and in the
// dedup set.
function describeRequestError( error: unknown ): string {
	if ( isAbortLike( error ) ) {
		return 'request aborted';
	}

	let message: string;
	if ( error instanceof Error ) {
		message = error.message;
	} else if ( error && typeof error === 'object' && 'message' in error ) {
		message = String( ( error as { message: unknown } ).message );
	} else {
		message = String( error );
	}

	const status =
		error && typeof error === 'object' && 'status' in error
			? ( error as { status?: unknown } ).status
			: undefined;

	return ( status ? `${ status } ${ message }` : message ).slice( 0, MAX_ERROR_REASON_LENGTH );
}

type BuildWowStatusResponse = {
	build_status?: string;
};

type FetchStatus = (
	siteIdentifier: string,
	signal: AbortSignal
) => Promise< BuildWowStatusResponse >;

const fetchBuildWowStatus: FetchStatus = async ( siteIdentifier, signal ) => {
	const response = ( await wpcom.req.get( {
		path: `/sites/${ siteIdentifier }/big-sky/build-wow/status`,
		apiNamespace: 'wpcom/v2',
		signal,
	} ) ) as BuildWowStatusResponse | null;

	return response ?? {};
};

export function pollForBuildWowStatus( {
	siteIdentifier,
	onReady,
	onFailed,
	onProgress,
	onRequestError,
	pollIntervalMs = 3000,
	requestTimeoutMs = 15000,
	fetchStatus = fetchBuildWowStatus,
}: {
	siteIdentifier: string;
	onReady: () => void;
	onFailed: ( status: string ) => void;
	onProgress?: ( status: string ) => void;
	onRequestError?: ( reason: string ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchStatus?: FetchStatus;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;
	const reportedReasons = new Set< string >();

	const poll = async () => {
		const controller = new AbortController();
		let hasPassedDeadline = false;
		const timeout = setTimeout( () => {
			hasPassedDeadline = true;
			controller.abort();
		}, requestTimeoutMs );
		requestController = controller;
		requestTimeout = timeout;

		let response: BuildWowStatusResponse | undefined;

		try {
			response = await fetchStatus( siteIdentifier, controller.signal );
		} catch ( error ) {
			// A failed status request does not mean the generation failed; keep polling.
			// Nothing is reported once the poller has been stopped: tearing down aborts
			// the in-flight request, and a user navigating away must not look like an
			// outage. Otherwise report each distinct reason once, up to a small cap, so
			// a 3s interval cannot emit hundreds of entries but a later, more
			// informative error is not hidden behind the first one either.
			if ( isActive ) {
				// The deadline having passed is not on its own proof that this rejection
				// is the abort: transports that ignore the signal run the request to its
				// real conclusion, and calling that a timeout would discard the actual
				// error. Both have to hold.
				const reason =
					hasPassedDeadline && isAbortLike( error )
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

		// Parsed outside the try so a malformed response cannot be reported as a
		// request failure.
		const status = typeof response?.build_status === 'string' ? response.build_status : undefined;

		// Terminal callbacks are dispatched outside the try so a throw from one of them
		// cannot be mistaken for a request failure and silently reschedule the poll.
		if ( status === BUILD_WOW_LIVE_STATUS ) {
			onReady();
			return;
		}
		if ( status && isBuildWowFailedStatus( status ) ) {
			onFailed( status );
			return;
		}
		// onProgress is not terminal, so a throw from it must not kill the loop.
		if ( status ) {
			const progressStatus = status;
			reportSafely( () => onProgress?.( progressStatus ) );
		}

		pollTimeout = setTimeout( () => {
			void poll().catch( () => {} );
		}, pollIntervalMs );
	};

	void poll().catch( () => {} );

	return () => {
		isActive = false;
		// Both timers are cleared before aborting: abort() runs the transport's own
		// listeners synchronously, and teardown happens exactly when the page is
		// going away, so a throw from one of them must not leak the request timer.
		if ( pollTimeout !== undefined ) {
			clearTimeout( pollTimeout );
		}
		if ( requestTimeout !== undefined ) {
			clearTimeout( requestTimeout );
		}
		requestController?.abort();
	};
}
