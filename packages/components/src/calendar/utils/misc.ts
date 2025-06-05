export function clampNumberOfMonths( numberOfMonths: number ) {
	return Math.min( 3, Math.max( 1, numberOfMonths ) );
}
