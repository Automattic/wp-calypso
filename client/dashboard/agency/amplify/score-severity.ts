export function severityFor( score: number, max: number ) {
	const percentage = ( score / max ) * 100;
	if ( percentage >= 80 ) {
		return 'good';
	}
	if ( percentage >= 50 ) {
		return 'warn';
	}
	return 'danger';
}
