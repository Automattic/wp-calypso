/** @format */

/**
 *
 * @param {object} options Whether to return a 'debug' and/or 'rtl' stylesheet.
 * @return {string} Returns stylesheet filename depending on options.
 */
function getStylesheet( { rtl, debug } = { rtl: false, debug: false } ) {
	// style[-debug][-rtl].css
	return 'style' + ( debug ? '-debug' : '' ) + ( rtl ? '-rtl' : '' ) + '.css';
}

export default getStylesheet;
