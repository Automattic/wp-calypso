const SECONDS_PER_DAY = 24 * 60 * 60;

export function hasExceededDormancyThreshold(
	lastSeenTimestamp?: number | null,
	dayLimit = 0
): boolean {
	if ( typeof lastSeenTimestamp !== 'number' || dayLimit <= 0 ) {
		return false;
	}

	const nowInSeconds = Math.floor( Date.now() / 1000 );
	const lastSeenThreshold = nowInSeconds - dayLimit * SECONDS_PER_DAY;

	return lastSeenTimestamp < lastSeenThreshold;
}
