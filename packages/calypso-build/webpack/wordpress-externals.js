/**
 * Converts @wordpress require into window reference
 *
 * Note this isn't the same as camel case because of the
 * way that numbers don't trigger the capitalized next letter
 *
 * @example
 * wordpressRequire( '@wordpress/api-fetch' ) = 'wp.apiFetch'
 * wordpressRequire( '@wordpress/i18n' ) = 'wp.i18n'
 *
 * @param {string} request import name
 * @return {string} global variable reference for import
 */
const wordpressRequire = request => {
	// @wordpress/components -> [ @wordpress, components ]
	const [ , name ] = request.split( '/' );

	// components -> wp.components
	return `wp.${ name.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() ) }`;
};

module.exports = ( context, request, callback ) =>
	/^@wordpress\//.test( request )
		? callback( null, `root ${ wordpressRequire( request ) }` )
		: callback();
