/**
 * Build the reader stream key for On This Day.
 * When month and day query args are present and valid, the key includes them so
 * stream state and API requests are scoped to that calendar day.
 */
export function getOnThisDayStreamKey(
	query: Record< string, string | string[] | undefined > | null | undefined
): string {
	if ( ! query ) {
		return 'on_this_day';
	}
	const rawM = query.month;
	const rawD = query.day;
	if ( rawM == null || rawD == null ) {
		return 'on_this_day';
	}
	const m = parseInt( Array.isArray( rawM ) ? rawM[ 0 ] : rawM, 10 );
	const d = parseInt( Array.isArray( rawD ) ? rawD[ 0 ] : rawD, 10 );
	if ( ! Number.isFinite( m ) || ! Number.isFinite( d ) || m < 1 || m > 12 || d < 1 || d > 31 ) {
		return 'on_this_day';
	}
	return `on_this_day:${ m }:${ d }`;
}

type OnThisDayQueryArgs = Parameters< typeof getOnThisDayStreamKey >[ 0 ];

/**
 * Subtitle for the list header: the selected calendar day, or "today" when no query args.
 */
export function getOnThisDayHeaderDateLabel( query: OnThisDayQueryArgs ): string {
	if ( getOnThisDayStreamKey( query ) === 'on_this_day' ) {
		return new Date().toLocaleDateString( undefined, {
			month: 'long',
			day: 'numeric',
		} );
	}
	const rawM = query?.month;
	const rawD = query?.day;
	const m = parseInt( Array.isArray( rawM ) ? rawM[ 0 ] : String( rawM ), 10 );
	const d = parseInt( Array.isArray( rawD ) ? rawD[ 0 ] : String( rawD ), 10 );
	const year = 2020; // leap year so Feb 29 displays if ever valid server-side
	return new Date( year, m - 1, d ).toLocaleDateString( undefined, {
		month: 'long',
		day: 'numeric',
	} );
}
