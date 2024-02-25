const ONE_K = 1000;
const ONE_M = ONE_K * 1000;
const ONE_G = ONE_M * 1000;

/*
 * Format a number larger than 1000 by appending a metric unit (K, M, G) and rounding to
 * the received decimal point, defaults to 0.
 * TODO: merge with formatNumberCompact by adding support for metric units other than 'K'
 */
export function formatNumberMetric( number, decimalPoints = 1 ) {
	if ( number < ONE_K ) {
		return String( number );
	}

	if ( number < ONE_M ) {
		return ( number / ONE_K ).toFixed( decimalPoints ) + 'K';
	}

	if ( number < ONE_G ) {
		return ( number / ONE_M ).toFixed( decimalPoints ) + 'M';
	}

	return ( number / ONE_G ).toFixed( decimalPoints ) + 'G';
}
