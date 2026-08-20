import { fetchSiteEndpoint, reportSafely } from './poller';

// Reader for the build-wow live-build feed:
// GET /sites/{id}/big-sky/build-wow/feed?since=N (wpcom). The status response
// carries `feed_seq` (the newest sequence number the build has published); the
// status poller forwards it here, and this reader fetches the event delta only
// when the cursor actually advanced — so the steady-state cost of the feed is
// one integer riding the existing 3s status poll.
//
// Events are idempotent, writer-sequenced upserts: the "diff" is an array
// slice the server computes from `since`, and replaying from 0 folds to the
// same state. A `run_id` change means the build was superseded (retry): the
// reader resets its cursor and refetches from 0 so the consumer can rebuild.

export type BuildWowFeedEvent = {
	seq: number;
	t?: number;
	type: string;
	key?: string;
	data?: Record< string, unknown >;
};

export type BuildWowFeedDelta = {
	run_id?: string;
	latest_seq?: number;
	events?: BuildWowFeedEvent[];
	assets?: Record< string, string >;
	/** Client-side flag: the run changed and prior folded state must be discarded. */
	reset?: boolean;
};

type FetchFeed = (
	siteIdentifier: string,
	since: number,
	signal: AbortSignal
) => Promise< BuildWowFeedDelta | null >;

const fetchBuildWowFeed: FetchFeed = async ( siteIdentifier, since, signal ) =>
	( await fetchSiteEndpoint< BuildWowFeedDelta >(
		siteIdentifier,
		`build-wow/feed?since=${ since }`,
		signal
	) ) ?? null;

export function createBuildWowFeedReader( {
	siteIdentifier,
	onDelta,
	requestTimeoutMs = 15000,
	fetchFeed = fetchBuildWowFeed,
}: {
	siteIdentifier: string;
	onDelta: ( delta: BuildWowFeedDelta ) => void;
	requestTimeoutMs?: number;
	fetchFeed?: FetchFeed;
} ): { onFeedSeq: ( seq: number ) => void; stop: () => void } {
	let cursor = 0;
	let runId: string | undefined;
	let isActive = true;
	let isFetching = false;
	let pendingSeq = 0;
	let controller: AbortController | undefined;

	const fetchDelta = async () => {
		if ( ! isActive || isFetching ) {
			return;
		}
		isFetching = true;
		controller = new AbortController();
		const timeout = setTimeout( () => controller?.abort(), requestTimeoutMs );
		const since = cursor;
		let progressed = false;

		try {
			const delta = await fetchFeed( siteIdentifier, since, controller.signal );
			if ( ! isActive || ! delta ) {
				return;
			}

			// A different run id supersedes everything folded so far: reset the
			// cursor and refetch the new run's feed from the beginning.
			if ( runId !== undefined && delta.run_id && delta.run_id !== runId ) {
				runId = delta.run_id;
				cursor = 0;
				progressed = true;
				pendingSeq = Math.max( pendingSeq, 1 );
				reportSafely( () => onDelta( { ...delta, events: [], assets: {}, reset: true } ) );
				return;
			}

			if ( delta.run_id ) {
				runId = delta.run_id;
			}
			if ( typeof delta.latest_seq === 'number' && delta.latest_seq > cursor ) {
				cursor = delta.latest_seq;
				progressed = true;
			}
			if ( delta.events?.length ) {
				reportSafely( () => onDelta( delta ) );
			}
		} catch {
			// A failed feed request costs one delta; the next feed_seq advance
			// retries from the same cursor. Never let feed problems disturb the
			// status poll.
		} finally {
			clearTimeout( timeout );
			controller = undefined;
			isFetching = false;
			// Coalesced advances that arrived mid-request are fetched now — but
			// only when this request moved the cursor (or reset the run). A
			// pending claim the server cannot satisfy (e.g. the feed was
			// cleared at `live` just after status reported a positive seq)
			// must wait for the next status poll instead of hot-looping.
			if ( isActive && pendingSeq > cursor && progressed ) {
				void fetchDelta();
			}
		}
	};

	return {
		onFeedSeq: ( seq: number ) => {
			if ( ! isActive || typeof seq !== 'number' || seq <= cursor ) {
				return;
			}
			pendingSeq = Math.max( pendingSeq, seq );
			void fetchDelta();
		},
		stop: () => {
			isActive = false;
			controller?.abort();
		},
	};
}
