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
		.map( generateReducerRequireString );
}

function getExtensionsModuleSync( extensionDirs ) {
	return generateExtensionsModuleString( getReducersSync( extensionDirs ) );
}

function pathExists( testPath ) {
	return new Promise( ( resolve ) => {
		fs.access( testPath, fs.constants.F_OK, ( err ) => resolve( ! err ) );
	} );
}

function getReducersAsync( extensionDirs = [] ) {
	const dirsWithReducers = Promise.all(
		extensionDirs.map( ( extensionDir ) =>
			pathExists( getReducerPath( extensionDir ) )
				.then( ( exists ) => exists && extensionDir ) )
	).then( compact );

	return dirsWithReducers.then( dirs =>
		dirs.map( generateReducerRequireString ) );
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

