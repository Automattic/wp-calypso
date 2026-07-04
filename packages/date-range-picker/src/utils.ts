import { __, sprintf } from '@wordpress/i18n';
import {
	startOfDay,
	isSameDay,
	addDays,
	addYears,
	startOfMonth,
	startOfYear,
	differenceInCalendarDays,
} from 'date-fns';
import { formatDate, parseYmdLocal, formatYmd, formatSiteYmd } from './datetime';

// Range helpers (inclusive)
const lastNDays = ( date: Date, number: number ) => ( {
	from: new Date( date.getFullYear(), date.getMonth(), date.getDate() - ( number - 1 ) ),
	to: date,
} );
const monthToDate = ( date: Date ) => ( {
	from: new Date( date.getFullYear(), date.getMonth(), 1 ),
	to: date,
} );
const yearToDate = ( date: Date ) => ( {
	from: new Date( date.getFullYear(), 0, 1 ),
	to: date,
} );
const lastTwelveMonths = ( date: Date ) => ( {
	from: new Date( date.getFullYear() - 1, date.getMonth(), date.getDate() + 1 ),
	to: date,
} );
const lastThreeYears = ( date: Date ) => ( {
	from: new Date( date.getFullYear() - 3, date.getMonth(), date.getDate() + 1 ),
	to: date,
} );

export type PresetId =
	| 'today'
	| 'yesterday'
	| 'last-7-days'
	| 'last-30-days'
	| 'last-90-days'
	| 'month-to-date'
	| 'last-12-months'
	| 'year-to-date'
	| 'last-3-years'
	| 'custom';

export const presetDefs = [
	{ id: 'today', label: __( 'Today' ) },
	{ id: 'yesterday', label: __( 'Yesterday' ) },
	{ id: 'last-7-days', label: __( 'Last 7 days' ) },
	{ id: 'last-30-days', label: __( 'Last 30 days' ) },
	{ id: 'last-90-days', label: __( 'Last 90 days' ) },
	{ id: 'month-to-date', label: __( 'Month to date' ) },
	{ id: 'last-12-months', label: __( 'Last 12 months' ) },
	{ id: 'year-to-date', label: __( 'Year to date' ) },
	{ id: 'last-3-years', label: __( 'Last 3 years' ) },
] as const satisfies ReadonlyArray< { id: Exclude< PresetId, 'custom' >; label: string } >;

export function computePresetRange( preset: PresetId, baseDate: Date ) {
	switch ( preset ) {
		case 'today':
			return { from: baseDate, to: baseDate };
		case 'yesterday':
			return {
				from: new Date( baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1 ),
				to: new Date( baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - 1 ),
			};
		case 'last-7-days':
			return lastNDays( baseDate, 7 );
		case 'last-30-days':
			return lastNDays( baseDate, 30 );
		case 'last-90-days':
			return lastNDays( baseDate, 90 );
		case 'month-to-date':
			return monthToDate( baseDate );
		case 'last-12-months':
			return lastTwelveMonths( baseDate );
		case 'year-to-date':
			return yearToDate( baseDate );
		case 'last-3-years':
			return lastThreeYears( baseDate );
		default:
			return undefined;
	}
}

export function getActivePresetId( from?: Date, to?: Date, baseDate?: Date ): PresetId | undefined {
	if ( ! from || ! to || ! baseDate ) {
		return;
	}
	let newFrom = startOfDay( from );
	let newTo = startOfDay( to );
	if ( newFrom!.getTime() > newTo!.getTime() ) {
		const tmp = newFrom;
		newFrom = newTo;
		newTo = tmp;
	}

	const todayStart = startOfDay( baseDate );
	const yesterdayStart = addDays( todayStart, -1 );

	if ( isSameDay( newFrom, todayStart ) && isSameDay( newTo, todayStart ) ) {
		return 'today';
	}
	if ( isSameDay( newFrom, yesterdayStart ) && isSameDay( newTo, yesterdayStart ) ) {
		return 'yesterday';
	}

	if ( isSameDay( newTo, todayStart ) ) {
		const diff = differenceInCalendarDays( todayStart, newFrom ); // inclusive days = diff + 1
		if ( diff === 6 ) {
			return 'last-7-days';
		}
		if ( diff === 29 ) {
			return 'last-30-days';
		}
		if ( diff === 89 ) {
			return 'last-90-days';
		}
		if (
			isSameDay( newFrom, addYears( todayStart, -1 ) ) ||
			isSameDay( newFrom, addDays( addYears( todayStart, -1 ), 1 ) )
		) {
			return 'last-12-months';
		}
		if (
			isSameDay( newFrom, addYears( todayStart, -3 ) ) ||
			isSameDay( newFrom, addDays( addYears( todayStart, -3 ), 1 ) )
		) {
			return 'last-3-years';
		}
	}

	if ( isSameDay( newFrom, startOfMonth( todayStart ) ) && isSameDay( newTo, todayStart ) ) {
		return 'month-to-date';
	}
	if ( isSameDay( newFrom, startOfYear( todayStart ) ) && isSameDay( newTo, todayStart ) ) {
		return 'year-to-date';
	}

	for ( const preset of presetDefs ) {
		const range = computePresetRange( preset.id as PresetId, todayStart );
		if (
			range &&
			isSameDay( newFrom, startOfDay( range.from ) ) &&
			isSameDay( newTo, startOfDay( range.to ) )
		) {
			return preset.id as PresetId;
		}
	}
	return undefined;
}

// Default whole-day times of day. A range with these times is treated as
// date-only, so the label omits the time and presets stay non-"custom".
export const DEFAULT_START_TIME = '00:00';
export const DEFAULT_END_TIME = '23:59';

export function hasCustomTimeOfDay( startTime?: string, endTime?: string ): boolean {
	return (
		( startTime !== undefined && startTime !== DEFAULT_START_TIME ) ||
		( endTime !== undefined && endTime !== DEFAULT_END_TIME )
	);
}

/**
 * Normalize a drafted range so the start boundary is never after the end.
 *
 * Dates are ordered first, with each time kept anchored to its start/end role
 * (so the whole-day defaults 00:00/23:59 stay on the correct boundary even when
 * the dates are entered backwards). Times are only reordered within a single
 * day — a cross-day window like 17:00 on day 1 → 09:00 on day 2 is a valid
 * overnight range and is left intact.
 */
export function orderRangeBoundaries(
	fromDate: Date,
	toDate: Date,
	fromTime: string,
	toTime: string
): { start: Date; end: Date; startTime: string; endTime: string } {
	const datesInOrder = fromDate <= toDate;
	const start = datesInOrder ? fromDate : toDate;
	const end = datesInOrder ? toDate : fromDate;
	let startTime = fromTime;
	let endTime = toTime;
	if ( formatSiteYmd( start ) === formatSiteYmd( end ) && startTime > endTime ) {
		[ startTime, endTime ] = [ endTime, startTime ];
	}
	return { start, end, startTime, endTime };
}

// Render an "HH:MM" time of day using the locale's short time style (e.g. "9:00 AM").
function formatTimeOfDayLabel( time: string, locale: string ): string {
	const [ hour, minute ] = time.split( ':' ).map( ( part ) => Number.parseInt( part, 10 ) );
	if ( ! Number.isFinite( hour ) || ! Number.isFinite( minute ) ) {
		return time;
	}
	const date = new Date();
	date.setHours( hour, minute, 0, 0 );
	return formatDate( date, locale, { timeStyle: 'short' } );
}

// UI-specific: Date range label for the picker. When a non-default time of day
// is set, each side shows its time alongside the date.
export function formatLabel(
	start: Date,
	end: Date,
	locale: string,
	startTime?: string,
	endTime?: string
) {
	const showTime = hasCustomTimeOfDay( startTime, endTime );
	const formatSide = ( date: Date, time?: string ) => {
		const dateLabel = formatDate( date, locale, { dateStyle: 'medium' } );
		if ( ! showTime || ! time ) {
			return dateLabel;
		}
		return sprintf(
			/* translators: %1$s: date, %2$s: time of day */
			__( '%1$s %2$s' ),
			dateLabel,
			formatTimeOfDayLabel( time, locale )
		);
	};

	return sprintf(
		/* translators: %1$s: start date (and time), %2$s: end date (and time) */
		__( '%1$s to %2$s' ),
		formatSide( start, startTime ),
		formatSide( end, endTime )
	);
}

// Determine if the given date range matches the last 7 days preset
export function isLast7Days(
	range: { start: Date; end: Date },
	timezoneString?: string,
	gmtOffset?: number
): boolean {
	const siteToday =
		parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) ) ??
		new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDate() );
	return getActivePresetId( range.start, range.end, siteToday ) === 'last-7-days';
}
