export type DateBucket = 'today' | 'yesterday' | 'this_week' | 'earlier';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay( date: Date ): Date {
	const d = new Date( date );
	d.setHours( 0, 0, 0, 0 );
	return d;
}

export function bucketFor( isoDate: string, now: Date ): DateBucket {
	const t = Date.parse( isoDate );
	if ( Number.isNaN( t ) ) {
		return 'earlier';
	}
	const itemTime = t;
	const nowTime = now.getTime();
	const startOfToday = startOfLocalDay( now ).getTime();
	const startOfYesterday = startOfToday - DAY_MS;

	if ( itemTime >= startOfToday ) {
		return 'today';
	}
	if ( itemTime >= startOfYesterday ) {
		return 'yesterday';
	}
	if ( nowTime - itemTime <= 7 * DAY_MS ) {
		return 'this_week';
	}
	return 'earlier';
}
