import { englishLocales } from '@automattic/i18n-utils';
import i18n, { numberFormat } from 'i18n-calypso';
import { THOUSANDS } from './thousands';

const ONE_K = 1000;
const ONE_M = ONE_K * 1000;
const ONE_G = ONE_M * 1000;

/**
 * Formats a number to a short format given a language code, i.e. 10K, 10.2M, 1G etc
 * @param   {number}     number              number to format
 * @param   {string}     code                language code e.g. 'es'
 * @returns {?string}                        A formatted string.
 */
export default function formatNumberCompact( number, code = i18n.getLocaleSlug() ) {
	//use numberFormat directly from i18n in this case!
	if ( isNaN( number ) ) {
		return null;
	}

	// Return small numbers as-is
	if ( number > -ONE_K && number < ONE_K ) {
		return numberFormat( number );
	}

	// Rely on `formatNumberMetric` for English locales, when the number is +1M or more, and -1M or less.
	if ( englishLocales.includes( code ) && ( number >= ONE_M || number <= -ONE_M ) ) {
		return formatNumberMetric( number );
	}

	//use numberFormat directly from i18n in this case!
	if ( ! THOUSANDS[ code ] ) {
		return null;
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
	if ( number < ONE_K && number > -ONE_K ) {
		return String( number );
	}

	if ( number < ONE_M && number > -ONE_M ) {
		return ( number / ONE_K ).toFixed( decimalPoints ) + 'K';
	}

	if ( number < ONE_G && number > -ONE_G ) {
		return ( number / ONE_M ).toFixed( decimalPoints ) + 'M';
	}

	return ( number / ONE_G ).toFixed( decimalPoints ) + 'G';
}
