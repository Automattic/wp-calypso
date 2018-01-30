/** @format */

/**
 * External dependencies
 */

import i18n, { numberFormat } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { THOUSANDS } from './thousands';

/**
 * Formats a number to a short format given a language code
 * @param   {Number}     number              number to format
 * @param   {String}     code                language code e.g. 'es'
 * @returns {?String}                        A formatted string.
 */
export default function formatNumberCompact( number, code = i18n.getLocaleSlug() ) {
	//use numberFormat directly from i18n in this case!
	if ( isNaN( number ) || ! THOUSANDS[ code ] ) {
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
