// datum.date is a native Date in the browser's local timezone; getMonth()/getDate()
// return unpadded numbers, so this must zero-pad to match the YYYY-MM-DD contract
// chartStart/chartEnd are expected to be in everywhere else they're consumed.
export function formatDatumPeriod( date: Date ): string {
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
}
