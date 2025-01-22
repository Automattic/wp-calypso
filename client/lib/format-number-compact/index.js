import i18n, { numberFormat } from 'i18n-calypso';
import { THOUSANDS } from './thousands';

/**
 * Formats a number to a short format given a language code
 * @param   {number}     number              number to format
 * @param   {string}     code                language code e.g. 'es'
 * @returns {?string}                        A formatted string.
 */
export default function formatNumberCompact( number, code = i18n.getLocaleSlug() ) {
	//use numberFormat directly from i18n in this case!
	if ( isNaN( number ) || ! THOUSANDS[ code ] ) {
		return null;
	}

	const { symbol, unitValue = 1000 } = THOUSANDS[ code ];

	const sign = number < 0 ? '-' : '';
	const absNumber = Math.abs( number );

	// no-op if we have a small number
	if ( absNumber < unitValue ) {
		return `${ sign }${ absNumber }`;
	}

	//show 2 sig figs, otherwise take leading sig figs.
	const decimals = absNumber < unitValue * 10 ? 1 : 0;

	// TODO clk numberFormat
	// can deprecate complately in favour of `{ notation: 'compact' }` in Intl.NumberFormat
	const value = numberFormat( absNumber / unitValue, {
		decimals,
	} );

	return `${ sign }${ value }${ symbol }`;
}

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
