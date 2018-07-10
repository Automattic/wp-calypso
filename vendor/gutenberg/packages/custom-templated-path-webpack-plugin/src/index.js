/**
 * External dependencies
 */
const escapeStringRegexp = require( 'escape-string-regexp' );

/**
 * Webpack plugin for handling specific template tags in Webpack configuration
 * values like those supported in the base Webpack functionality (e.g. `name`).
 *
 * @see webpack.TemplatedPathPlugin
 */
class CustomTemplatedPathPlugin {
	/**
	 * CustomTemplatedPathPlugin constructor. Initializes handlers as a tuple
	 * set of RegExp, handler, where the regular expression is used in matching
	 * a Webpack asset path.
	 *
	 * @param {Object.<string,Function>} handlers Object keyed by tag to match,
	 *                                            with function value returning
	 *                                            replacement string.
	 */
	constructor( handlers ) {
		this.handlers = [];

		for ( const [ key, handler ] of Object.entries( handlers ) ) {
			const regexp = new RegExp( `\\[${ escapeStringRegexp( key ) }\\]`, 'gi' );
			this.handlers.push( [ regexp, handler ] );
		}
	}

	/**
	 * Webpack plugin application logic.
	 *
	 * @param {Object} compiler Webpack compiler
	 */
	apply( compiler ) {
		compiler.hooks.compilation.tap( 'CustomTemplatedPathPlugin', ( compilation ) => {
			compilation.mainTemplate.hooks.assetPath.tap( 'CustomTemplatedPathPlugin', ( path, data ) => {
				for ( let i = 0; i < this.handlers.length; i++ ) {
					const [ regexp, handler ] = this.handlers[ i ];
					if ( regexp.test( path ) ) {
						return path.replace( regexp, handler( path, data ) );
					}
				}

				return path;
			} );
		} );
	}
}

module.exports = CustomTemplatedPathPlugin;
