import { dateI18n } from '@wordpress/date';

/**
 * Creates a full-day time range for activity log filtering, spanning from the start of the
 * first date to the end of the last date in the specified timezone.
 */
export function buildTimeRangeForActivityLog(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number
): { after: string; before: string } {
	const timezoneParam = timezoneString || ( typeof gmtOffset === 'number' ? gmtOffset : undefined );
	const startYmd = dateI18n( 'Y-m-d', start, timezoneParam );
	const endYmd = dateI18n( 'Y-m-d', end, timezoneParam );

	const after = `${ startYmd } 00:00:00`;
	const before = `${ endYmd } 23:59:59`;

	return { after, before };
}
