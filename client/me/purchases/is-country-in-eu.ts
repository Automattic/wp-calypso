export function isCountryInEu( country: string, date?: string ): boolean {
	const time = Date.parse( date ?? 'now' );
	const brexitTime = Date.parse( '2020-01-31 23:00 GMT' );
	const countries = [
		'AT',
		'BE',
		'BG',
		'CY',
		'CZ',
		'DE',
		'DK',
		'EE',
		'EL',
		'ES',
		'FI',
		'FR',
		'HR',
		'HU',
		'IE',
		'IT',
		'LT',
		'LU',
		'LV',
		'MT',
		'NL',
		'PL',
		'PT',
		'RO',
		'SE',
		'SI',
		'SK',
	];
	// GB is a real country code but sometimes this might be called with the
	// invalid 'UK' code.
	if ( ( country === 'GB' || country === 'UK' ) && time < brexitTime ) {
		return true;
	}
	return countries.includes( country );
}
