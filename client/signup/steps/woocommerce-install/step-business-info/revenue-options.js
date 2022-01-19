import formatCurrency from '@automattic/format-currency';
import { __, _x, sprintf } from '@wordpress/i18n';

// These are rough exchange rates from USD.  Precision is not paramount.
// The keys here should match the keys in `getCurrencyData`.
const exchangeRates = {
	US: 1,
	EU: 0.9,
	IN: 71.24,
	GB: 0.76,
	BR: 4.19,
	VN: 23172.5,
	ID: 14031.0,
	BD: 84.87,
	PK: 154.8,
	RU: 63.74,
	TR: 5.75,
	MX: 19.37,
	CA: 1.32,
};

export function getCountryCode( countryState ) {
	if ( ! countryState ) {
		return null;
	}

	return countryState.split( ':' )[ 0 ];
}

export function getCurrencyRegion( countryState ) {
	let region = getCountryCode( countryState );
	const euCountries = [];
	if ( euCountries.includes( region ) ) {
		region = 'EU';
	}

	return region;
}

const getNumberRangeString = ( currency, min, max = 0 ) => {
	if ( ! max ) {
		return sprintf(
			/* translators: store product count or revenue */
			_x( '%s+', 'store product count or revenue', 'woocommerce-admin' ),
			formatCurrency( min, currency )
		);
	}

	return sprintf(
		/* translators: store product count or revenue range */
		_x( '%1$s - %2$s', 'store product count or revenue range', 'woocommerce-admin' ),
		formatCurrency( min, currency ),
		formatCurrency( max, currency )
	);
};

const convertCurrency = ( value, country ) => {
	const region = getCurrencyRegion( country );

	if ( region === 'US' ) {
		return value;
	}

	const exchangeRate = exchangeRates[ region ] || exchangeRates.US;

	return Math.round( value * exchangeRate );
};

export const getRevenueOptions = ( currency, country ) => [
	{
		value: 'none',
		label: sprintf(
			/* translators: %s: $0 revenue amount */
			__( "%s (I'm just getting started)", 'woocommerce-admin' ),
			formatCurrency( 0, currency )
		),
	},
	{
		value: 'up-to-2500',
		label: sprintf(
			/* translators: %s: A given revenue amount, e.g., $2500 */
			__( 'Up to %s', 'woocommerce-admin' ),
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
			__( 'More than %s', 'woocommerce-admin' ),
			formatCurrency( convertCurrency( 250000, country ), currency )
		),
	},
	{
		value: 'rather-not-say',
		label: __( "I'd rather not say", 'woocommerce-admin' ),
	},
];
