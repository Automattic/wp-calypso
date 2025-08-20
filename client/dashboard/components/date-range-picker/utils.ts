import { __ } from '@wordpress/i18n';

// Normalize/comparison helpers
const startOfDay = ( date?: Date ) =>
	date ? new Date( date.getFullYear(), date.getMonth(), date.getDate() ) : undefined;
const isSameDay = ( firstDay?: Date, secondDay?: Date ) =>
	!! firstDay && !! secondDay && firstDay.getTime() === secondDay.getTime();
const addDays = ( date: Date, number: number ) =>
	new Date( date.getFullYear(), date.getMonth(), date.getDate() + number );
const addYears = ( date: Date, number: number ) =>
	new Date( date.getFullYear() + number, date.getMonth(), date.getDate() );
const firstOfMonth = ( date: Date ) => new Date( date.getFullYear(), date.getMonth(), 1 );
const jan1 = ( date: Date ) => new Date( date.getFullYear(), 0, 1 );
const daysBetween = ( firstDay: Date, secondDay: Date ) =>
	Math.round(
		( startOfDay( secondDay )!.getTime() - startOfDay( firstDay )!.getTime() ) / 86400000
	);

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

	const todayStart = startOfDay( baseDate )!;
	const yesterdayStart = addDays( todayStart, -1 );

	if ( isSameDay( newFrom, todayStart ) && isSameDay( newTo, todayStart ) ) {
		return 'today';
	}
	if ( isSameDay( newFrom, yesterdayStart ) && isSameDay( newTo, yesterdayStart ) ) {
		return 'yesterday';
	}

	if ( isSameDay( newTo, todayStart ) ) {
		const diff = daysBetween( newFrom!, todayStart ); // inclusive days = diff + 1
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

	if ( isSameDay( newFrom, firstOfMonth( todayStart ) ) && isSameDay( newTo, todayStart ) ) {
		return 'month-to-date';
	}
	if ( isSameDay( newFrom, jan1( todayStart ) ) && isSameDay( newTo, todayStart ) ) {
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
