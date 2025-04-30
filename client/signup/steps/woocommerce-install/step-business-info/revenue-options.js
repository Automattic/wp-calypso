import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
// These are rough exchange rates from USD.  Precision is not paramount.
// The keys here should match the keys in `getCurrencyData`.
const exchangeRates = {
	US: { rate: 1, code: 'USD' },
	EU: { rate: 0.9, code: 'EUR' },
	IN: { rate: 71.24, code: 'INR' },
	GB: { rate: 0.76, code: 'GBP' },
	BR: { rate: 4.19, code: 'BRL' },
	VN: { rate: 23172.5, code: 'VND' },
	ID: { rate: 14031.0, code: 'IDR' },
	BD: { rate: 84.87, code: 'BDT' },
	PK: { rate: 154.8, code: 'PKR' },
	RU: { rate: 63.74, suffix: 'RUB' },
	TR: { rate: 5.75, code: 'TRY' },
	MX: { rate: 19.37, code: 'MXN' },
	CA: { rate: 1.32, code: 'CAD' },
};

export function getCountryCode( countryState ) {
	if ( ! countryState ) {
		return null;
	}

	return countryState.split( ':' )[ 0 ];
}

export function getCurrencyFromRegion( countryState ) {
	let region = getCountryCode( countryState );

	const euCountries = [
		// See https://github.com/woocommerce/woocommerce/blob/727ccd0dd351c4b7a66824b654275c396a7cdd77/plugins/woocommerce/includes/class-wc-countries.php#L368.
		'AT',
		'BE',
		'BG',
		'CY',
		'CZ',
		'DE',
		'DK',
		'EE',
		'ES',
		'FI',
		'FR',
		'GR',
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
	if ( euCountries.includes( region ) ) {
		region = 'EU';
	}

	return exchangeRates[ region ] || exchangeRates.US;
}

const getNumberRangeString = ( currency, min, max = 0 ) => {
	if ( ! max ) {
		return sprintf(
			/* translators: product count or revenue range, e.g. $100+ */
			__( '%s+' ),
			formatCurrency( min, currency )
		);
	}

	return sprintf(
		/* translators: product count or revenue range, e.g. $100 - $1000 */
		__( '%1$s - %2$s' ),
		formatCurrency( min, currency ),
		formatCurrency( max, currency )
	);
};

const convertCurrency = ( value, country ) => {
	const currency = getCurrencyFromRegion( country );

	const rate = currency.rate;
	if ( rate === 1 ) {
		return value;
	}

	const digits = rate.toString().split( '.' )[ 0 ].length;
	const multiplier = Math.pow( 10, 2 + digits );

	return Math.round( ( value * rate ) / multiplier ) * multiplier;
};

export const getRevenueOptions = ( country ) => {
	const currency = getCurrencyFromRegion( country ).code;

	return [
		{
			value: 'none',
			label: sprintf(
				/* translators: %s: $0 revenue amount */
				__( "%s (I'm just getting started)" ),
				formatCurrency( 0, currency )
			),
		},
		{
			value: 'up-to-2500',
			label: sprintf(
				/* translators: %s: A given revenue amount, e.g., $2500 */
				__( 'Up to %s' ),
				formatCurrency( convertCurrency( 2500, country ), currency )
			),
		},
		{
			value: '2500-10000',
			label: getNumberRangeString(
				currency,
				convertCurrency( 2500, country ),
				convertCurrency( 10000, country )
			),
		},
		{
			value: '10000-50000',
			label: getNumberRangeString(
				currency,
				convertCurrency( 10000, country ),
				convertCurrency( 50000, country )
			),
		},
		{
			value: '50000-250000',
			label: getNumberRangeString(
				currency,
				convertCurrency( 50000, country ),
				convertCurrency( 250000, country )
			),
		},
		{
			value: 'more-than-250000',
			label: sprintf(
				/* translators: %s: A given revenue amount, e.g., $250000 */
				__( 'More than %s' ),
				formatCurrency( convertCurrency( 250000, country ), currency )
			),
		},
		{
			value: 'rather-not-say',
			label: __( "I'd rather not answer" ),
		},
	];
};
