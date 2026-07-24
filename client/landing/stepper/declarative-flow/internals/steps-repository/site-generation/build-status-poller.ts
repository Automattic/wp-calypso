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
	pollIntervalMs = 3000,
	requestTimeoutMs = 15000,
	fetchStatus = fetchBuildWowStatus,
}: {
	siteIdentifier: string;
	onReady: () => void;
	onFailed: ( status: string ) => void;
	onProgress?: ( status: string ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchStatus?: FetchStatus;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;

	const poll = async () => {
		requestController = new AbortController();
		requestTimeout = setTimeout( () => requestController?.abort(), requestTimeoutMs );

		try {
			const { build_status: status } = await fetchStatus(
				siteIdentifier,
				requestController.signal
			);

			if ( isActive && status ) {
				if ( status === BUILD_WOW_LIVE_STATUS ) {
					onReady();
					return;
				}
				if ( isBuildWowFailedStatus( status ) ) {
					onFailed( status );
					return;
				}
				onProgress?.( status );
			}
		} catch {
			// A failed status request does not mean the generation failed; keep polling.
		} finally {
			if ( requestTimeout !== undefined ) {
				clearTimeout( requestTimeout );
			}
		}

		if ( isActive ) {
			pollTimeout = setTimeout( poll, pollIntervalMs );
		}
	};

	void poll();

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
