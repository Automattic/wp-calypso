import { fetchUser } from '@automattic/api-core';

interface Options {
	/** Poll cadence in milliseconds. */
	intervalMs?: number;
}

// Background cadence for the unseen flag. Slower than the open panel's note
// polling: this only keeps the bell indicator live, not the note list.
const DEFAULT_INTERVAL_MS = 60 * 1000;

/**
 * Subscribe to the user's "has unseen notifications" flag.
 *
 * The notifications app only polls while it is mounted (i.e. while the panel is
 * open), so consumers that unmount it on close freeze the bell badge. This polls
 * the user's `has_unseen_notes` flag (via api-core's `/me` fetcher) on an
 * interval and reports changes through `onChange`, independently of the panel.
 * It is a plain function (not a hook) so it works from class components and can
 * be dynamically imported by hosts that disallow static imports from this app.
 *
 * Polling pauses while the tab is hidden and runs immediately when it becomes
 * visible again, so a badge that went stale in the background refreshes promptly.
 * @returns An unsubscribe function that stops polling.
 */
export function subscribeUnseenNotifications(
	onChange: ( hasUnseen: boolean ) => void,
	{ intervalMs = DEFAULT_INTERVAL_MS }: Options = {}
): () => void {
	let active = true;
	let timer: ReturnType< typeof setTimeout > | undefined;

	const poll = async () => {
		if ( document.visibilityState === 'visible' ) {
			try {
				const { has_unseen_notes } = await fetchUser();
				if ( active && typeof has_unseen_notes === 'boolean' ) {
					onChange( has_unseen_notes );
				}
			} catch {
				// Ignore — the next tick retries.
			}
		}
		if ( active ) {
			timer = setTimeout( poll, intervalMs );
		}
	};

	const handleVisibilityChange = () => {
		if ( document.visibilityState === 'visible' ) {
			clearTimeout( timer );
			poll();
		}
	};

	poll();
	document.addEventListener( 'visibilitychange', handleVisibilityChange );

	return () => {
		active = false;
		clearTimeout( timer );
		document.removeEventListener( 'visibilitychange', handleVisibilityChange );
	};
}
