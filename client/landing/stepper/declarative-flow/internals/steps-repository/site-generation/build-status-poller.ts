import { fetchSiteEndpoint, startPolling } from './poller';

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

const fetchBuildWowStatus: FetchStatus = async ( siteIdentifier, signal ) =>
	( await fetchSiteEndpoint< BuildWowStatusResponse >(
		siteIdentifier,
		'build-wow/status',
		signal
	) ) ?? {};

export function pollForBuildWowStatus( {
	siteIdentifier,
	onReady,
	onFailed,
	onRequestError,
	pollIntervalMs,
	requestTimeoutMs,
	fetchStatus = fetchBuildWowStatus,
}: {
	siteIdentifier: string;
	onReady: () => void;
	onFailed: ( status: string ) => void;
	onRequestError?: ( reason: string ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchStatus?: FetchStatus;
} ): () => void {
	return startPolling< BuildWowStatusResponse >( {
		fetch: ( signal ) => fetchStatus( siteIdentifier, signal ),
		onRequestError,
		pollIntervalMs,
		requestTimeoutMs,
		onResponse: ( response ) => {
			const status = typeof response.build_status === 'string' ? response.build_status : undefined;
			if ( status === BUILD_WOW_LIVE_STATUS ) {
				onReady();
				return 'stop';
			}
			if ( status && isBuildWowFailedStatus( status ) ) {
				onFailed( status );
				return 'stop';
			}
		},
	} );
}
