import { dateI18n } from '@wordpress/date';
import { startOfDay, endOfDay } from 'date-fns';

const HOUR_MS = 3_600_000;

/**
 * Convert a local date range to inclusive epoch-second boundaries (UTC).
 * Covers the full start and end calendar days.
 */
export function buildTimeRangeInSeconds(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number
): { startSec: number; endSec: number } {
	if ( timezoneString ) {
		const startYmd = dateI18n( 'Y-m-d', start, timezoneString );
		const endYmd = dateI18n( 'Y-m-d', end, timezoneString );
		const startSec = +dateI18n( 'U', `${ startYmd } 00:00:00`, timezoneString );
		const endSec = +dateI18n( 'U', `${ endYmd } 23:59:59`, timezoneString );
		if ( Number.isFinite( startSec ) && Number.isFinite( endSec ) ) {
			return { startSec, endSec };
		}
	}
	if ( typeof gmtOffset === 'number' ) {
		const startLocal = startOfDay( start ).getTime();
		const endLocal = endOfDay( end ).getTime();
		const shiftMs = gmtOffset * HOUR_MS;
		return {
			startSec: Math.floor( ( startLocal - shiftMs ) / 1000 ),
			endSec: Math.floor( ( endLocal - shiftMs ) / 1000 ),
		};
	}
	// last-resort fallback: browser local
	const startSec = Math.floor( startOfDay( start ).getTime() / 1000 );
	const endSec = Math.floor( endOfDay( end ).getTime() / 1000 );
	return { startSec, endSec };
}
