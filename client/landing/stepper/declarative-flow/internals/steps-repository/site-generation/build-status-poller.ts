import { fetchSiteEndpoint, reportSafely, startPolling } from './poller';

// The build-wow status endpoint is the single source of truth for the waiting
// screen: GET /wpcom/v2/sites/{id}/big-sky/build-wow/status. Alongside the
// machine fields (build_status: delivering → activating → verifying → live,
// or failed:<error_code>; build_phase) it returns a server-computed `ui`
// block — headline state, localized copy, and the sidebar checklist — that
// this client renders verbatim instead of interpreting pipeline internals.
// See big_sky_build_wow_status_ui() in big-sky.php (wpcom).
const BUILD_WOW_LIVE_STATUS = 'live';
const BUILD_WOW_FAILED_STATUS_PREFIX = 'failed:';

function isBuildWowFailedStatus( status: string ): boolean {
	return status.startsWith( BUILD_WOW_FAILED_STATUS_PREFIX );
}

export type BuildWowUiStep = {
	id?: string;
	label?: string;
	state?: 'pending' | 'active' | 'done' | string;
};

export type BuildWowUi = {
	state?: 'queued' | 'generating' | 'finishing' | 'ready' | 'failed' | string;
	label?: string;
	detail?: string;
	progress?: number;
	is_terminal?: boolean;
	can_retry?: boolean;
	steps?: BuildWowUiStep[];
};

export type BuildWowStatusResponse = {
	build_status?: string;
	build_phase?: string;
	ui?: BuildWowUi;
	/**
	 * Newest live-build feed sequence number (see build-feed.ts). 0 or absent
	 * when the backend has no feed for this build.
	 */
	feed_seq?: number;
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
	onUpdate,
	onFeedSeq,
	onRequestError,
	pollIntervalMs,
	requestTimeoutMs,
	fetchStatus = fetchBuildWowStatus,
}: {
	siteIdentifier: string;
	onReady: () => void;
	onFailed: ( status: string, ui?: BuildWowUi ) => void;
	onUpdate?: ( ui: BuildWowUi ) => void;
	onFeedSeq?: ( seq: number ) => void;
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
			const ui = response.ui;
			if ( ui ) {
				reportSafely( () => onUpdate?.( ui ) );
			}

			// Before the terminal checks: a failed build's feed is what the
			// failure screen renders, so its last delta must still be fetched.
			const feedSeq = response.feed_seq;
			if ( typeof feedSeq === 'number' && feedSeq > 0 ) {
				reportSafely( () => onFeedSeq?.( feedSeq ) );
			}

			// Terminal handling prefers the server's ui verdict; the raw
			// build_status fallback keeps this working against a backend that
			// does not send the ui block yet.
			const status = typeof response.build_status === 'string' ? response.build_status : undefined;
			if ( ui?.state === 'ready' || status === BUILD_WOW_LIVE_STATUS ) {
				onReady();
				return 'stop';
			}
			if ( ui?.state === 'failed' || ( status && isBuildWowFailedStatus( status ) ) ) {
				onFailed( status ?? 'failed:unknown', ui );
				return 'stop';
			}
		},
	} );
}
