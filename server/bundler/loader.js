var config = require( 'config' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	var dependencies,
		loadSection = '',
		sectionLoaders = '';

	if ( config.isEnabled( 'code-splitting' ) ) {
		dependencies = [
			"var page = require( 'page' ),",
			"\tlayoutFocus = require( 'lib/layout-focus' ),",
			"\tReact = require( 'react' ),",
			"\tLoadingError = require( 'layout/error' ),",
			"\tcontroller = require( 'controller' ),",
			"\tpreloadHub = require( 'sections-preload' ).hub;",
			'\n',
			'var _loadedSections = {};\n'
		].join( '\n' );

		sections.forEach( function( section ) {
			loadSection += singleEnsure( section.name );
			section.paths.forEach( function( path ) {
				sectionLoaders += splitTemplate( path, section );
			} );
		} );

		return [
			dependencies,
			'function preload( section ) {',
			'	switch ( section ) {',
			'	' + loadSection,
			'	}',
			'}',
			'\n',
			"preloadHub.on( 'preload', preload );",
			'\n',
			'module.exports = {',
			'	get: function() {',
			'		return ' + JSON.stringify( sections ) + ';',
			'	},',
			'	load: function() {',
			'		' + sectionLoaders,
			'	}',
			'};'
		].join( '\n' );
	}

	dependencies = [
		"var page = require( 'page' ),",
		"\tcontroller = require( 'controller' );\n"
	].join( '\n' );

	sectionLoaders = getRequires( sections );

	return [
		dependencies,
		'module.exports = {',
		'	get: function() {',
		'		return ' + JSON.stringify( sections ) + ';',
		'	},',
		'	load: function() {',
		'		' + sectionLoaders,
		'	}',
		'};'
	].join( '\n' );
}

function getRequires( sections ) {
	var content = '';

	sections.forEach( function( section ) {
		content += requireTemplate( section );
	} );

	return content;
}

function splitTemplate( path, section ) {
	var pathRegex = getPathRegex( path ),
		result;

	result = [
		'page( ' + pathRegex + ', function( context, next ) {',
		'	if ( _loadedSections[ ' + JSON.stringify( section.module ) + ' ] ) {',
		'		controller.setSection( ' + JSON.stringify( section ) + ' )( context );',
		'		layoutFocus.next();',
		'		return next();',
		'	}',
		'	context.store.dispatch( { type: "SECTION_SET", isLoading: true } );',
		'	require.ensure([], function( require ) {',
		'		if ( window.__chunkErrors && window.__chunkErrors[ ' + JSON.stringify( section.name ) + '] ) {',
		'			if ( ! LoadingError.isRetry() ) {',
		'				LoadingError.retry( ' + JSON.stringify( section.name ) + ' );',
		'			} else {',
		'				context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
		'				LoadingError.show( ' + JSON.stringify( section.name ) + ' );',
		'			}',
		'			return;',
		'		}',
		'		context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
		'		controller.setSection( ' + JSON.stringify( section ) + ' )( context );',
		'		if ( ! _loadedSections[ ' + JSON.stringify( section.module ) + ' ] ) {',
		'			require( ' + JSON.stringify( section.module ) + ' )( controller.clientRouter );',
		'			_loadedSections[ ' + JSON.stringify( section.module ) + ' ] = true;',
		'		}',
		'		layoutFocus.next();',
		'		next();',
		'	}, ' + JSON.stringify( section.name ) + ' );',
		'} );\n'
	];

	return result.join( '\n' );
}

function getPathRegex( pathString ) {
	var regex;

	if ( pathString === '/' ) {
		return JSON.stringify( pathString );
	}

	regex = utils.pathToRegExp( pathString );

	return '/' + regex.toString().slice( 1, -1 ) + '/';
}

function requireTemplate( section ) {
	var pathRegex,
		result;

	result = section.paths.reduce( function( acc, path ) {
		pathRegex = getPathRegex( path );

		return acc.concat( [
			'page( ' + pathRegex + ', function( context, next ) {',
			'	controller.setSection( ' + JSON.stringify( section ) + ' )( context );',
			'	next();',
			'} );\n'
		] );
	}, [] );

	result.push(
		'require( ' + JSON.stringify( section.module ) + ' )( controller.clientRouter );\n\n'
	);

	return result.join( '\n' );
}

function singleEnsure( chunkName ) {
	var result = [
		'case ' + JSON.stringify( chunkName ) + ':',
		'	return require.ensure([], function() {}, ' + JSON.stringify( chunkName ) + ' );',
		'	break;\n'
	];

	return result.join( '\n' );
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
