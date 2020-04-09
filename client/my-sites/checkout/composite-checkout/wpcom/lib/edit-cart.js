export function replacePlanWithDifferentLength() {}

export function adjustItemPricesForCountry() {}

// replace this once https://github.com/Automattic/wp-calypso/pull/36758 is merged
export function formatValueForCurrency( currency, value ) {
	if ( currency !== 'USD' ) {
		throw new Error( 'Non-USD currency is not yet supported' );
	}

	return `${ value / 100 } ${ currency }`;
}
