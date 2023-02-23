export function isCountryInEu( country: string, date?: string ): boolean {
	const time = Date.parse( date ?? 'now' );
	const brexitTime = Date.parse( '2020-01-31 23:00 GMT' );
	const countries = [
		'AT',
		'BE',
		'BG',
		'CH',
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
		'XI',
	];
	if ( country === 'GB' && time < brexitTime ) {
		return true;
	}
	return countries.includes( country );
}
