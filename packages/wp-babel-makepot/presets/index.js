/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * Internal dependencies
 */
const defaultPreset = require( './default' );

/**
 * Extend babel base options.
 *
 * @param   {object} options         Babel options
 * @param   {Array}  options.presets Babel presets
 * @param   {Array}  options.plugins Babel plugins
 * @param   {...any} options.rest    Other babel options
 * @returns {object} Babel options object
 */
const extendBaseOptions = ( { presets = [], plugins = [], ...rest } ) => ( {
	code: false,
	ast: true,
	presets,
	cwd: path.resolve( __dirname, '..' ),
	plugins: [
		...plugins,
		[
			'@automattic/babel-plugin-i18n-calypso',
			{
				headers: { 'content-type': 'text/plain; charset=UTF-8' },
			},
		],
	],
	...rest,
} );

const presets = {
	default: extendBaseOptions( defaultPreset ),
};

module.exports = presets;
