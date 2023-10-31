import i18n, { numberFormat } from 'i18n-calypso';
import { THOUSANDS } from './thousands';

const ONE_K = 1000;
const ONE_M = ONE_K * 1000;
const ONE_G = ONE_M * 1000;

/**
 * Formats a number to a short format given a language code
 * @param   {number}     number              number to format
 * @param   {string}     code                language code e.g. 'es'
 * @returns {?string}                        A formatted string.
 */
export default function formatNumberCompact( number, code = i18n.getLocaleSlug() ) {
	//use numberFormat directly from i18n in this case!
	if ( isNaN( number ) ) {
		return null;
	}

	// Rely on `formatNumberMetric` we don't support the language, or when the number is 1M+
	if ( ! THOUSANDS[ code ] || number >= ONE_M ) {
		return formatNumberMetric( number );
	}

	const { decimal, grouping, symbol, unitValue = 1000 } = THOUSANDS[ code ];

	const sign = number < 0 ? '-' : '';
	const absNumber = Math.abs( number );

	// no-op if we have a small number
	if ( absNumber < unitValue ) {
		return `${ sign }${ absNumber }`;
	}

	//show 2 sig figs, otherwise take leading sig figs.
	const decimals = absNumber < unitValue * 10 ? 1 : 0;

	const value = numberFormat( absNumber / unitValue, {
		decimals,
		thousandsSep: grouping,
		decPoint: decimal,
	} );

	return `${ sign }${ value }${ symbol }`;
}

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
