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

export const BUILD_WOW_DELIVERY_PHASES = [ 'delivering', 'activating', 'verifying' ];

// Maps a delivery phase onto the tail of the designed step list, so a build that
// is already `delivering` when this screen loads does not jump straight to the
// last step. Returns null for a status outside the known walk.
export function getStepIndexForStatus( status: string, stepCount: number ): number | null {
	const phase = BUILD_WOW_DELIVERY_PHASES.indexOf( status );
	if ( phase === -1 || stepCount === 0 ) {
		return null;
	}
	const firstDeliveryStep = Math.max( 0, stepCount - BUILD_WOW_DELIVERY_PHASES.length );
	return Math.min( stepCount - 1, firstDeliveryStep + phase );
}

function isBuildWowFailedStatus( status: string ): boolean {
	return status.startsWith( BUILD_WOW_FAILED_STATUS_PREFIX );
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
	onRequestError?: ( error: unknown ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchStatus?: FetchStatus;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;
	let consecutiveFailures = 0;

	const poll = async () => {
		const controller = new AbortController();
		const timeout = setTimeout( () => controller.abort(), requestTimeoutMs );
		requestController = controller;
		requestTimeout = timeout;

		let status: string | undefined;

		try {
			const response = await fetchStatus( siteIdentifier, controller.signal );
			status = typeof response.build_status === 'string' ? response.build_status : undefined;
			consecutiveFailures = 0;
		} catch ( error ) {
			// A failed status request does not mean the generation failed; keep polling.
			// Only the first failure of a run is reported: at a 3s interval an outage
			// would otherwise emit hundreds of identical entries.
			consecutiveFailures += 1;
			if ( consecutiveFailures === 1 ) {
				onRequestError?.( error );
			}
		} finally {
			clearTimeout( timeout );
		}

		if ( ! isActive ) {
			return;
		}

		// Callbacks are dispatched outside the try so a throw from one of them cannot
		// be mistaken for a request failure and silently reschedule the poll.
		if ( status === BUILD_WOW_LIVE_STATUS ) {
			onReady();
			return;
		}
		if ( status && isBuildWowFailedStatus( status ) ) {
			onFailed( status );
			return;
		}
		if ( status ) {
			onProgress?.( status );
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
