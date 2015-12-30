var config = require( 'config' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	var dependencies = '',
		preloadFunctionBody = '',
		loadFunctionBody = '';

	if ( config.isEnabled( 'code-splitting' ) ) {
		dependencies = [
			"var page = require( 'page' ),",
			"\tlayoutFocus = require( 'lib/layout-focus' ),",
			"\tReact = require( 'react' ),",
			"\tLoadingError = require( 'layout/error' ),",
			"\tclasses = require( 'component-classes' );",
			'',
			'var _loadedSections = {};'
		].join( '\n' );

		preloadFunctionBody = getPreloadSwitch( sections );
		loadFunctionBody = getRouteHandlers( sections );
	} else {
		loadFunctionBody = getRequires( sections );
	}

	return [
		dependencies,
		'module.exports = {',
		'	get: function() {',
		'		return ' + JSON.stringify( sections ) + ';',
		'	},',
		'	load: function() {',
		'		' + loadFunctionBody,
		'	},',
		'	preload: function( section ) {',
		'		' + preloadFunctionBody,
		'	}',
		'};'
	].join( '\n' );
}

function getPreloadSwitch( sections ) {
	return [
		'switch ( section ) {',
			cases( sections ),
		'}'
	].join( '\n' );

	function cases( sections ) {
		return sections.map( function( section ) {
			return ensureCaseTemplate( section.name );
		} ).join( '' );
	}
}

function getRequires( sections ) {
	return sections.map( function( section ) {
		return requireTemplate( section.module );
	} ).join( '' );
}

function getRouteHandlers( sections ) {
	return sections.map( function( section ) {
		return section.paths.map( function( path ) {
			return pageTemplate( path, section.module, section.name );
		} )
	} ).reduce( function( acc, section ) { return acc.concat( section ); }, [] );
}

function pageTemplate( path, module, chunkName ) {
	var regex, result;
	if ( path === '/' ) {
		path = JSON.stringify( path );
	} else {
		regex = utils.pathToRegExp( path );
		path = '/' + utils.regExpToString( regex.toString().slice( 1, -1 ) ) + '/';
	}

	return [
		'page( ' + path + ', function( context, next ) {',
		'	if ( _loadedSections[ ' + JSON.stringify( module ) + ' ] ) {',
		'		layoutFocus.next();',
		'		return next();',
		'	}',
		'	context.store.dispatch( { type: "SET_SECTION", isLoading: true } );',
		'	context.store.dispatch( { type: "SET_SECTION", chunkName: ' + JSON.stringify( chunkName ) + ' } );',
		'	require.ensure([], function( require, error ) {',
		'		if ( error ) {',
		'			if ( ! LoadingError.isRetry() ) {',
		'				LoadingError.retry( ' + JSON.stringify( chunkName ) + ' );',
		'			} else {',
		'				context.store.dispatch( { type: "SET_SECTION", isLoading: false } );',
		'				LoadingError.show( ' + JSON.stringify( chunkName ) + ' );',
		'			}',
		'			return;',
		'		}',
		'		context.store.dispatch( { type: "SET_SECTION", isLoading: false } );',
		'		if ( ! _loadedSections[ ' + JSON.stringify( module ) + ' ] ) {',
		'			require( ' + JSON.stringify( module ) + ' )();',
		'			_loadedSections[ ' + JSON.stringify( module ) + ' ] = true;',
		'		}',
		'		layoutFocus.next();',
		'		next();',
		'	}, ' + JSON.stringify( chunkName ) + ' );',
		'} );\n'
	].join( '\n' );
}

function requireTemplate( module ) {
	return 'require( ' + JSON.stringify( module ) + ' )();\n';
}

function ensureCaseTemplate( chunkName ) {
	return [
		'case ' + JSON.stringify( chunkName ) + ':',
		'	return require.ensure([], function() {}, ' + JSON.stringify( chunkName ) + ' );',
		'	break;\n'
	].join( '\n' );
}

module.exports = function( content ) {
	var sections;

	this.cacheable && this.cacheable();

	sections = require( this.resourcePath );

	if ( ! Array.isArray( sections ) ) {
		this.emitError( 'Chunks module is not an array' );
		return content;
	}

	this.addDependency( 'page' );

	return getSectionsModule( sections );
};

