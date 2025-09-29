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
import { formatDate, parseYmdLocal, formatYmd } from '../../utils/datetime';

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

// UI-specific: Date range label for the picker
export function formatLabel( start: Date, end: Date, locale: string ) {
	return sprintf(
		/* translators: %1$s: start date, %2$s: end date */
		__( '%1$s to %2$s' ),
		formatDate( start, locale, { dateStyle: 'medium' } ),
		formatDate( end, locale, { dateStyle: 'medium' } )
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
