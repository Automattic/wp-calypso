const existsSync = require( 'fs' ).existsSync;
const readdirSync = require( 'fs' ).readdirSync;
const path = require( 'path' );
const camelCase = require( 'lodash' ).camelCase;
const upperFirst = require( 'lodash' ).upperFirst;

function getReducers( plugins = {} ) {
	return plugins
		.filter( ( plugin ) => existsSync( path.join( 'client', 'plugins', plugin, 'state', 'reducer.js' ) ) )
		.map( ( plugin ) => `'${ plugin }': require( 'plugins/${ plugin }/state/reducer' )\n` );
}

function getDecorators( plugins = {} ) {
	return plugins.map( ( plugin ) => {
		const decoratorsPath = path.join( 'client', 'plugins', plugin, 'decorators' );
		if ( existsSync( decoratorsPath ) ) {
			const decorators = readdirSync( decoratorsPath );
			const decoratorObjects = decorators.map( decorator => {
				const decoratorName = upperFirst( camelCase( decorator.split( '.' )[ 0 ] ) );
				return `\t'${ decoratorName }': require( 'plugins/${ plugin }/decorators/${ decorator }' )\n`;
			} );

			return `'${ plugin }': {
				${ decoratorObjects }
				}`;
		}
	} ).filter( Boolean );
}

function getPluginsModule( plugins ) {
	return `module.exports = {
		reducers: function() {
			return {
				${ getReducers( plugins ) }
			};
		},

		decorators: function() {
			return {
				${ getDecorators( plugins ) }
			};
		}
	};
`;
}

module.exports = function( content ) {
	this.cacheable && this.cacheable();

	const plugins = require( this.resourcePath );

	if ( ! Array.isArray( plugins ) ) {
		this.emitError( 'Plugins module is not an array' );
		return content;
	}
	return getPluginsModule( plugins );
};
