export function sortEarningsPeriods( periods ) {
	return [ ...periods ].sort( ( a, b ) => b.localeCompare( a ) );
}

export function swapYearMonth( period ) {
	const [ year, month ] = period.split( '-' );
	return `${ month }-${ year }`;
}
