export type DeliveryWindow = {
	/**
	 * Hour of day, 0-23. The picker exposes only even 2-hour buckets
	 * (0, 2, … 22) in local time, but the stored UTC value may be any whole
	 * hour once a non-even offset is applied.
	 */
	hour: number;
	/** Day of week, 0 (Sunday) - 6 (Saturday). */
	day: number;
};

const DAYS_IN_WEEK = 7;
const HOURS_IN_DAY = 24;

/** Even-hour buckets (0, 2, … 22) shown in the delivery-window picker in local-time mode. */
export const STANDARD_DELIVERY_HOUR_BUCKETS = Array.from(
	{ length: HOURS_IN_DAY / 2 },
	( _, index ) => index * 2
);

function normalizeDeliveryHour( hour: number ): number {
	return ( ( hour % HOURS_IN_DAY ) + HOURS_IN_DAY ) % HOURS_IN_DAY;
}

function normalizeDay( day: number ): number {
	return ( ( day % DAYS_IN_WEEK ) + DAYS_IN_WEEK ) % DAYS_IN_WEEK;
}

/**
 * Snap an hour (0-23) down to the nearest even-numbered delivery-window bucket
 * (0, 2, … 22). The picker only exposes 2-hour buckets, so a stored value that
 * doesn't line up (e.g. legacy data stored as an even UTC hour, viewed with an
 * odd offset) is snapped so the dropdown always has a valid selected option.
 */
function snapToHourBucket( hour: number ): number {
	return hour - ( hour % 2 );
}

/**
 * Round a minute offset to the nearest whole hour, rounding half-hour ties
 * away from zero so negative zones like UTC-3:30 (America/St_Johns) become -4,
 * not -3.
 */
function roundMinutesToWholeHours( offsetMinutes: number ): number {
	if ( offsetMinutes === 0 ) {
		return 0;
	}
	const sign = Math.sign( offsetMinutes );
	return sign * Math.round( Math.abs( offsetMinutes ) / 60 );
}

/**
 * Shift a delivery window by a whole number of hours, wrapping the day when the
 * hour crosses midnight in either direction.
 */
function shiftWindow( window: DeliveryWindow, deltaHours: number ): DeliveryWindow {
	const rawHour = window.hour + deltaHours;
	const dayShift = Math.floor( rawHour / HOURS_IN_DAY );
	const hour = ( ( rawHour % HOURS_IN_DAY ) + HOURS_IN_DAY ) % HOURS_IN_DAY;

	return {
		hour,
		day: normalizeDay( window.day + dayShift ),
	};
}

/**
 * Compute the device's timezone offset, in whole hours, relative to UTC for a
 * given IANA timezone. A positive value means the local time is ahead of UTC
 * (e.g. `Asia/Tokyo` → +9); a negative value means behind (e.g.
 * `America/New_York` → -4 during EDT).
 *
 * Timezones with sub-hour offsets (e.g. `Asia/Kolkata` at +5:30) are rounded
 * to the nearest whole hour, since the delivery-window picker only supports
 * whole hours. This means the cron may fire up to ~30 minutes away from the
 * displayed bucket for those users, which is acceptable for this coarse
 * 2-hour-window UI.
 * @param timezone An IANA timezone string, e.g. `America/New_York`. When
 *   undefined (device timezone could not be detected), returns `null` so
 *   callers can fall back to displaying raw UTC values.
 * @param reference The instant at which to evaluate the offset. Defaults to
 *   now, so daylight-saving transitions are respected.
 * @returns The whole-hour offset from UTC, or `null` when no timezone is given
 *   or the timezone is invalid.
 */
export function getDeliveryWindowOffsetHours(
	timezone: string | undefined,
	reference: Date = new Date()
): number | null {
	if ( ! timezone ) {
		return null;
	}

	try {
		const formatter = new Intl.DateTimeFormat( 'en-US', {
			timeZone: timezone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hourCycle: 'h23',
		} );

		const parts = formatter
			.formatToParts( reference )
			.reduce< Record< string, number > >( ( acc, part ) => {
				if ( part.type !== 'literal' ) {
					acc[ part.type ] = Number( part.value );
				}
				return acc;
			}, {} );

		const asUtc = Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second
		);

		// Round to whole minutes first: `asUtc` is truncated to second precision
		// while `reference` carries milliseconds, and that sub-second gap can
		// otherwise tip a true :30 offset (e.g. Asia/Kolkata) to the wrong side.
		const offsetMinutes = Math.round( ( asUtc - reference.getTime() ) / 60000 );
		return roundMinutesToWholeHours( offsetMinutes );
	} catch ( e ) {
		return null;
	}
}

/**
 * Convert a stored UTC delivery window to the equivalent local-time window for
 * display. The hour is snapped down to the nearest lower even bucket so the picker
 * always has a valid selected option, and the day wraps when crossing midnight.
 * @param utc The window as stored on the backend (interpreted as UTC).
 * @param offsetHours The local offset from UTC in whole hours.
 */
export function fromUtcDeliveryWindow( utc: DeliveryWindow, offsetHours: number ): DeliveryWindow {
	const shifted = shiftWindow( utc, offsetHours );
	return {
		hour: snapToHourBucket( shifted.hour ),
		day: shifted.day,
	};
}

/**
 * Convert a local-time delivery window (as picked in the UI, always an even
 * bucket) back to the UTC window to persist on the backend. The result is exact
 * (not snapped) so the delivery time stays accurate even for odd offsets; the
 * stored UTC hour may therefore be odd.
 * @param local The window as displayed/picked in local time.
 * @param offsetHours The local offset from UTC in whole hours.
 */
export function toUtcDeliveryWindow( local: DeliveryWindow, offsetHours: number ): DeliveryWindow {
	return shiftWindow( local, -offsetHours );
}

/**
 * Convert a stored UTC window for display in the picker. When the device
 * timezone is unknown (`offsetHours === null`), returns the raw stored values
 * without snapping so day-only edits do not change an untouched hour.
 */
export function getDisplayDeliveryWindow(
	utc: DeliveryWindow,
	offsetHours: number | null
): DeliveryWindow {
	if ( offsetHours === null ) {
		return { hour: utc.hour, day: utc.day };
	}
	return fromUtcDeliveryWindow( utc, offsetHours );
}

/**
 * Apply a partial edit from the picker and return the UTC window to persist.
 * In UTC-fallback mode, only fields present in `edit` are updated; the rest
 * are taken unchanged from `storedUtc`.
 */
export function applyDeliveryWindowEdit(
	storedUtc: DeliveryWindow,
	edit: Partial< DeliveryWindow >,
	offsetHours: number | null
): DeliveryWindow {
	if ( offsetHours === null ) {
		return {
			hour: edit.hour ?? storedUtc.hour,
			day: edit.day ?? storedUtc.day,
		};
	}
	const display = getDisplayDeliveryWindow( storedUtc, offsetHours );
	const local = {
		hour: edit.hour ?? display.hour,
		day: edit.day ?? display.day,
	};
	return toUtcDeliveryWindow( local, offsetHours );
}

/**
 * Hour values to render in the delivery-window `<select>`, so the control can
 * always represent the current setting.
 *
 * - **UTC fallback** (`utcFallback: true`): every whole hour 0–23, since the UI
 *   shows the raw stored UTC hour (which may be odd after prior saves).
 * - **Local-time mode**: the standard even 2-hour buckets, plus the current
 *   `displayHour` when it is not already listed (defensive; normally snapped to even).
 */
export function getDeliveryHourPickerHours( displayHour: number, utcFallback: boolean ): number[] {
	const normalizedDisplayHour = normalizeDeliveryHour( displayHour );

	if ( utcFallback ) {
		return Array.from( { length: HOURS_IN_DAY }, ( _, hour ) => hour );
	}

	if ( STANDARD_DELIVERY_HOUR_BUCKETS.includes( normalizedDisplayHour ) ) {
		return STANDARD_DELIVERY_HOUR_BUCKETS;
	}

	return [ ...STANDARD_DELIVERY_HOUR_BUCKETS, normalizedDisplayHour ].sort( ( a, b ) => a - b );
}
