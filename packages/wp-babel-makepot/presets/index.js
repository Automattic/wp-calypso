const path = require( 'path' );
const defaultPreset = require( './default' );

/**
 * Extend babel base options.
 *
 * @param   {Object} options         Babel options
 * @param   {Array}  options.presets Babel presets
 * @param   {Array}  options.plugins Babel plugins
 * @param   {...any} options.rest    Other babel options
 * @returns {Object} Babel options object
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
