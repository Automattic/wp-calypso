// Export from "./my-custom-loader.js" or whatever you want.

const makepotPlugin = require( '@wordpress/babel-plugin-makepot' )();

module.exports = require( 'babel-loader' ).custom( () => {
	return {
		// Passed Babel's 'PartialConfig' object.
		config( cfg ) {
			if ( -1 !== cfg.options.filename.indexOf( 'editor.js' ) ) {
				const plugins = [
					[
						makepotPlugin,
						{
							output: 'gettextgetet.pop',
							headers: {
								'content-type': 'text/plain; charset=UTF-8',
								'x-generator': 'calypso',
								'plural-forms': 'nplurals=2; plural=n == 1 ? 0 : 1;',
							},
						},
					],
				];

				return {
					...cfg.options,
					plugins: plugins,
				};
			}

			return cfg.options;
		},
	};
} );
