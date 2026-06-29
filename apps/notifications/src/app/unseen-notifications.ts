import { fetchUser } from '@automattic/api-core';

interface Options {
	/** Poll cadence in milliseconds. */
	intervalMs?: number;
}

const DEFAULT_INTERVAL_MS = 60 * 1000;

/**
 * Poll the user's `has_unseen_notes` flag and report changes, so a consumer's
 * bell badge stays live while the notifications panel (and its own polling) is
 * closed. Pauses while the tab is hidden. Returns an unsubscribe function.
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
