const existsSync = require( 'fs' ).existsSync;
const path = require( 'path' );

function getReducers( plugins = {} ) {
	return plugins.map( ( plugin ) => {
		if ( existsSync( path.join( 'client', 'plugins', plugin, 'state', 'reducer.js' ) ) ) {
			return `'${ plugin }': require( 'plugins/${ plugin }/state/reducer' )\n`;
		}
	} );
}

function getPluginsModule( plugins ) {
	return `module.exports = {
		reducers: function() {
			return {
				${ getReducers( plugins ) }
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
