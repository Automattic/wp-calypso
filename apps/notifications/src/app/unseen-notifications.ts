interface NotificationsListResponse {
	notes?: Array< { timestamp: string } >;
	last_seen_time?: number | string;
}

interface PinghubEvent {
	response?: { type?: string };
}

interface WpcomClient {
	req: {
		get: (
			descriptor: { path: string; apiVersion: string },
			query: Record< string, unknown >,
			callback: ( error: unknown, data: NotificationsListResponse ) => void
		) => unknown;
	};
	pinghub: {
		connect: ( path: string, callback: ( error: unknown, event: PinghubEvent ) => void ) => void;
		disconnect: ( path: string ) => void;
	};
}

// Same note stream the panel's RestClient uses: a push tells us "something
// changed, refetch", and `/notifications` carries the notes + server last-seen
// time we derive the count from. Mirrors RestClient's subscribe/poll fallback.
const NOTE_STREAM_PATH = '/wpcom/me/newest-note-data';
const POLL_INTERVAL_MS = 30 * 1000;
const SUBSCRIBE_TRIES = 3;
const SUBSCRIBE_COOLDOWN_MS = 120 * 1000;
// Cap matches the panel's max page; the badge only needs "many", not an exact
// tally beyond this.
const NOTE_LIMIT = 100;

/**
 * Subscribe to the unseen-notifications count via the notifications note stream.
 *
 * The panel's RestClient only runs while the panel is open, so consumers that
 * unmount it on close freeze the bell badge. This reuses the same mechanism —
 * a pinghub websocket push (real-time) with a `/notifications` poll fallback —
 * to keep a live count without mounting the panel. Count is the number of notes
 * newer than the server's last-seen time. Returns an unsubscribe function.
 */
export function subscribeUnseenCount(
	wpcom: WpcomClient,
	onCount: ( count: number ) => void
): () => void {
	let active = true;
	let subscribed = false;
	let subscribing = false;
	let subscribeTry = 0;
	let pollTimer: ReturnType< typeof setTimeout > | undefined;
	let cooldownTimer: ReturnType< typeof setTimeout > | undefined;

	const fetchCount = () => {
		wpcom.req.get(
			{ path: '/notifications/', apiVersion: '1.1' },
			{ fields: 'id,timestamp', number: NOTE_LIMIT },
			( error, data ) => {
				if ( ! active || error || ! data?.notes ) {
					return;
				}
				const lastSeenTime = Number( data.last_seen_time ) || 0;
				const count = data.notes.filter(
					( note ) => Date.parse( note.timestamp ) / 1000 > lastSeenTime
				).length;
				onCount( count );
			}
		);
	};

	const stopPolling = () => {
		clearTimeout( pollTimer );
		pollTimer = undefined;
	};

	const schedulePoll = () => {
		stopPolling();
		if ( active && ! subscribed ) {
			pollTimer = setTimeout( () => {
				fetchCount();
				schedulePoll();
			}, POLL_INTERVAL_MS );
		}
	};

	const trySubscribe = () => {
		if ( ! active || subscribed || subscribing ) {
			return;
		}
		if ( subscribeTry < SUBSCRIBE_TRIES ) {
			subscribing = true;
			subscribeTry++;
			wpcom.pinghub.connect( NOTE_STREAM_PATH, handlePing );
		} else if ( ! cooldownTimer ) {
			// Stop hammering the socket; retry after a cooldown, polling meanwhile.
			cooldownTimer = setTimeout( () => {
				cooldownTimer = undefined;
				subscribeTry = 0;
				trySubscribe();
			}, SUBSCRIBE_COOLDOWN_MS );
		}
	};

	function handlePing( error: unknown, event: PinghubEvent ) {
		subscribing = false;
		const type = event?.response?.type;

		if ( error || ! type || type === 'error' ) {
			subscribed = false;
			schedulePoll();
			trySubscribe();
		} else if ( type === 'open' ) {
			subscribed = true;
			subscribeTry = 0;
			stopPolling(); // Rely on push while connected.
			fetchCount(); // Refresh on (re)connect.
		} else if ( type === 'close' ) {
			subscribed = false;
			subscribeTry = 0;
			schedulePoll();
			trySubscribe();
		} else if ( type === 'message' ) {
			fetchCount(); // The push is a trigger; the count comes from the refetch.
		}
	}

	fetchCount();
	schedulePoll();
	trySubscribe();

	return () => {
		active = false;
		stopPolling();
		clearTimeout( cooldownTimer );
		if ( subscribed || subscribing ) {
			try {
				wpcom.pinghub.disconnect( NOTE_STREAM_PATH );
			} catch {
				// Best effort.
			}
		}
	};
}
