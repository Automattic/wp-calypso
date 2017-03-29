const fs = require( 'fs' );
const path = require( 'path' );
const camelCase = require( 'lodash' ).camelCase;
const compact = require( 'lodash' ).compact;

function getReducerPath( extensionDir ) {
	return path.join( 'client', 'extensions', extensionDir, 'state', 'reducer.js' );
}

function generateReducerRequireString( extensionDir ) {
	return `'${ camelCase( extensionDir ) }': require( 'extensions/${ extensionDir }/state/reducer' )`;
}

function generateExtensionsModuleString( reducerRequires ) {
	return `module.exports = {
		reducers: function() {
			return {
				${ reducerRequires.join( ',\n' ) }
			};
		}
	};`;
}

function getReducersSync( extensionDirs = [] ) {
	return extensionDirs
		.filter( ( extensionDir ) => fs.existsSync( getReducerPath( extensionDir ) ) )
		.map( ( extensionDir ) => generateReducerRequireString( extensionDir ) );
}

function getExtensionsModuleSync( extensionDirs ) {
	return generateExtensionsModuleString( getReducersSync( extensionDirs ) );
}

function getReducersAsync( extensionDirs = [] ) {
	return new Promise( ( resolveAll ) => {
		Promise.all(
			extensionDirs.map( ( extensionDir ) => {
				return new Promise( ( resolveOne ) => {
					fs.access( getReducerPath( extensionDir ), fs.constants.F_OK, ( err ) => {
						resolveOne( ( ! err ) && generateReducerRequireString( extensionDir ) );
					} );
				} );
			} )
		).then( ( reducerRequires ) => resolveAll( compact( reducerRequires ) ) );
	} );
}

function getExtensionsModuleAsync( extensionDirs ) {
	return getReducersAsync( extensionDirs )
		.then( generateExtensionsModuleString );
}

module.exports = function( content ) {
	this.cacheable && this.cacheable();

	const extensionDirs = require( this.resourcePath );

	if ( ! Array.isArray( extensionDirs ) ) {
		this.emitError( 'Extensions module is not an array' );
		return content;
	}

	const callback = this.async();
	if ( ! callback ) {
		return getExtensionsModuleSync( extensionDirs );
	}

	getExtensionsModuleAsync( extensionDirs )
		.then( ( moduleString ) => callback( null, moduleString ) )
		.catch( ( reason ) => callback( reason ) );
};

