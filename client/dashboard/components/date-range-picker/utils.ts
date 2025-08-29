import { __, sprintf } from '@wordpress/i18n';
import {
	startOfDay,
	addHours,
	addDays,
	addYears,
	startOfMonth,
	startOfYear,
	differenceInCalendarDays,
	isSameDay,
	subDays,
} from 'date-fns';
import { formatDate } from '../../utils/datetime';

// Range helpers (inclusive)
const lastNDays = ( date: Date, number: number ) => ( {
	from: new Date(
		Date.UTC( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - ( number - 1 ) )
	),
	to: date,
} );
const monthToDate = ( date: Date ) => ( {
	from: new Date( Date.UTC( date.getUTCFullYear(), date.getUTCMonth(), 1 ) ),
	to: date,
} );
const yearToDate = ( date: Date ) => ( {
	from: new Date( Date.UTC( date.getUTCFullYear(), 0, 1 ) ),
	to: date,
} );
const lastTwelveMonths = ( date: Date ) => ( {
	from: new Date(
		Date.UTC( date.getUTCFullYear() - 1, date.getUTCMonth(), date.getUTCDate() + 1 )
	),
	to: date,
} );
const lastThreeYears = ( date: Date ) => ( {
	from: new Date(
		Date.UTC( date.getUTCFullYear() - 3, date.getUTCMonth(), date.getUTCDate() + 1 )
	),
	to: date,
} );

export type PresetId =
	| 'today'
	| 'yesterday'
	| 'last-7-days'
	| 'last-30-days'
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
	{ id: 'month-to-date', label: __( 'Month to date' ) },
	{ id: 'last-12-months', label: __( 'Last 12 months' ) },
	{ id: 'year-to-date', label: __( 'Year to date' ) },
	{ id: 'last-3-years', label: __( 'Last 3 years' ) },
] as const satisfies ReadonlyArray< { id: Exclude< PresetId, 'custom' >; label: string } >;

export function computePresetRange( preset: PresetId, baseDate: Date ) {
	const addDaysUtc = ( daysOffset: number = 0 ) => {
		return addDays( baseDate, daysOffset );
	};
	switch ( preset ) {
		case 'today':
			// Return the same date for both start and end
			// The actual time boundaries will be set in buildTimeRangeInSeconds
			return { from: baseDate, to: baseDate };
		case 'yesterday':
			// Return the same date for both start and end
			// The actual time boundaries will be set in buildTimeRangeInSeconds
			return {
				from: addDaysUtc( -1 ),
				to: addDaysUtc( -1 ),
			};
		case 'last-7-days':
			return lastNDays( baseDate, 7 );
		case 'last-30-days':
			return lastNDays( baseDate, 30 );
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

export function getActivePresetId(
	from?: Date,
	to?: Date,
	baseDate?: Date,
	timezoneString?: string,
	gmtOffset?: number
): PresetId | undefined {
	if ( ! from || ! to || ! baseDate ) {
		return;
	}

	// Normalize dates to start of day for comparison
	let newFrom = startOfDay( from );
	let newTo = startOfDay( to );

	if ( newFrom.getTime() > newTo.getTime() ) {
		const tmp = newFrom;
		newFrom = newTo;
		newTo = tmp;
	}

	// Calculate site timezone dates for comparison
	let today: Date;
	let yesterday: Date;

	if ( timezoneString ) {
		// Use site timezone if available
		const now = new Date();
		const siteTime = new Intl.DateTimeFormat( 'en-US', {
			timeZone: timezoneString,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		} ).formatToParts( now );

		const year = parseInt( siteTime.find( ( p ) => p.type === 'year' )?.value || '0' );
		const month = parseInt( siteTime.find( ( p ) => p.type === 'month' )?.value || '0' ) - 1;
		const day = parseInt( siteTime.find( ( p ) => p.type === 'day' )?.value || '0' );

		today = startOfDay( new Date( year, month, day ) );
		yesterday = subDays( today, 1 );
	} else if ( typeof gmtOffset === 'number' ) {
		// Use GMT offset if no timezone string
		const now = new Date();
		const utcTime = now.getTime();
		const siteTime = utcTime + gmtOffset * 60 * 60 * 1000;
		const siteDate = new Date( siteTime );

		today = startOfDay( siteDate );
		yesterday = subDays( today, 1 );
	} else {
		// Fallback to UTC
		today = startOfDay( baseDate );
		yesterday = subDays( baseDate, 1 );
	}

	if ( isSameDay( newFrom, today ) && isSameDay( newTo, today ) ) {
		return 'today';
	}
	if ( isSameDay( newFrom, yesterday ) && isSameDay( newTo, yesterday ) ) {
		return 'yesterday';
	}

	if ( isSameDay( newTo, today ) ) {
		const diff = differenceInCalendarDays( today, newFrom );
		// differenceInCalendarDays returns the number of calendar days between dates
		// For inclusive ranges, we need to check if the difference matches our expected ranges
		if ( diff === 6 ) {
			return 'last-7-days';
		}
		if ( diff === 29 ) {
			return 'last-30-days';
		}
		if (
			isSameDay( newFrom, addYears( today, -1 ) ) ||
			isSameDay( newFrom, addDays( addYears( today, -1 ), 1 ) )
		) {
			return 'last-12-months';
		}
		if (
			isSameDay( newFrom, addYears( today, -3 ) ) ||
			isSameDay( newFrom, addDays( addYears( today, -3 ), 1 ) )
		) {
			return 'last-3-years';
		}
	}

	if ( isSameDay( newFrom, startOfMonth( today ) ) && isSameDay( newTo, today ) ) {
		return 'month-to-date';
	}
	if ( isSameDay( newFrom, startOfYear( today ) ) && isSameDay( newTo, today ) ) {
		return 'year-to-date';
	}

	// Test against computed preset ranges
	for ( const preset of presetDefs ) {
		const range = computePresetRange( preset.id as PresetId, today );
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

// UI-specific: Date range label for the picker
export function formatLabel( start: Date, end: Date, locale: string ) {
	// Normalize to site calendar days first, then format visually for the locale.
	// This avoids off-by-one issues when the Date carries a different local timezone
	// than the site's timezone.
	return sprintf(
		/* translators: %1$s: start date, %2$s: end date */
		__( '%1$s to %2$s' ),
		formatDate( start, locale, { dateStyle: 'medium' } ),
		formatDate( end, locale, { dateStyle: 'medium' } )
	);
}

// Calculate timezone-aware today for preset detection
export function getTimezoneAwareDate(
	baseDate: Date,
	timezoneString?: string,
	gmtOffset?: number
): Date {
	if ( timezoneString ) {
		const siteTime = new Intl.DateTimeFormat( 'en-US', {
			timeZone: timezoneString,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		} ).formatToParts( baseDate );

		const year = parseInt( siteTime.find( ( p ) => p.type === 'year' )?.value || '0' );
		const month = parseInt( siteTime.find( ( p ) => p.type === 'month' )?.value || '0' ) - 1;
		const day = parseInt( siteTime.find( ( p ) => p.type === 'day' )?.value || '0' );

		return startOfDay( new Date( year, month, day ) );
	} else if ( typeof gmtOffset === 'number' ) {
		return startOfDay( addHours( baseDate, gmtOffset ) );
	}
	return startOfDay( baseDate );
}
