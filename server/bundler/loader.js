var config = require( 'config' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	var dependencies,
		loadSection = '',
		sectionLoaders = '';

	if ( config.isEnabled( 'code-splitting' ) ) {
		dependencies = [
			"var config = require( 'config' ),",
			"\tpage = require( 'page' ),",
			"\tReact = require( 'react' ),",
			"\tactivateNextLayoutFocus = require( 'state/ui/layout-focus/actions' ).activateNextLayoutFocus,",
			"\tLoadingError = require( 'layout/error' ),",
			"\tcontroller = require( 'controller' ),",
			"\trestoreLastSession = require( 'lib/restore-last-path' ).restoreLastSession,",
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
			'};',
			'\n',
			'function onErrorCallback( context, sectionName ) {',
			'	function callback( error ) {',
			'		if ( ! LoadingError.isRetry() ) {',
			'			LoadingError.retry( sectionName );',
			'		} else {',
			'			console.error(error);',
			'			context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
			'			LoadingError.show( sectionName );',
			'		}',
			'		return;',
			'	}',
			'	return callback;',
			'}',
			'\n',
			'function requireCallback( context, next, section, module, moduleId ) {',
			'	function callback( require ) {',
			'		context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
			'		controller.setSection( section )( context );',
			'		if ( ! _loadedSections[ module ] ) {',
			'			require( moduleId )( controller.clientRouter );',
			'			_loadedSections[ module ] = true;',
			'		}',
			'		context.store.dispatch( activateNextLayoutFocus() );',
			'		next();',
			'	}',
			'	return callback;',
			'}'
		].join( '\n' );
	}

	dependencies = [
		"var config = require( 'config' ),",
		"\tpage = require( 'page' ),",
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
		sectionString = JSON.stringify( section ),
		sectionNameString = JSON.stringify( section.name ),
		moduleString = JSON.stringify( section.module ),
		envIdString = JSON.stringify( section.envId ),
		result;

	result = [
		'page( ' + pathRegex + ', function( context, next ) {',
		'	var envId = ' + envIdString + ';',
		'	if ( envId && envId.indexOf( config( "env_id" ) ) === -1 ) {',
		'		return next();',
		'	}',
		'	if ( _loadedSections[ ' + moduleString + ' ] ) {',
		'		controller.setSection( ' + sectionString + ' )( context );',
		'		context.store.dispatch( activateNextLayoutFocus() );',
		'		return next();',
		'	}',
		'	if ( config.isEnabled( "restore-last-location" ) && restoreLastSession( context.path ) ) {',
		'		return;',
		'	}',
		'	context.store.dispatch( { type: "SECTION_SET", isLoading: true } );',
		'   const moduleId = require.resolve( ' + moduleString + ');',
		'   const callback = requireCallback( context, next, ' + sectionString + ', ' + moduleString + ', moduleId );',
		'   const onError = onErrorCallback( context, ' + sectionNameString + ' );',
		'   require.ensure([], callback, onError, ' + sectionNameString + ' );',
		'} );\n'
	];

	return result.join( '\n' );
}

function getPathRegex( pathString ) {
	if ( pathString === '/' ) {
		return JSON.stringify( pathString );
	}
	const regex = utils.pathToRegExp( pathString );
	return '/' + regex.toString().slice( 1, -1 ) + '/';
}

function requireTemplate( section ) {
	var pathRegex,
		result;

	result = section.paths.reduce( function( acc, path ) {
		pathRegex = getPathRegex( path );

		return acc.concat( [
			'page( ' + pathRegex + ', function( context, next ) {',
			'	var envId = ' + JSON.stringify( section.envId ) + ';',
			'	if ( envId && envId.indexOf( config( "env_id" ) ) === -1 ) {',
			'		return next();',
			'	}',
			'	controller.setSection( ' + JSON.stringify( section ) + ' )( context );',
			'	require( ' + JSON.stringify( section.module ) + ' )( controller.clientRouter );',
			'	next();',
			'} );\n'
		] );
	}, [] );

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

function sectionsWithCSSUrls( sections ) {
	return sections.map( section => Object.assign( {}, section, section.css && {
		cssUrls: utils.getCssUrls( section.css )
	} ) );
}

module.exports = function( content ) {
	const sections = require( this.resourcePath );

	if ( ! Array.isArray( sections ) ) {
		this.emitError( 'Chunks module is not an array' );
		return content;
	}

	this.addDependency( 'page' );

	return getSectionsModule( sectionsWithCSSUrls( sections ) );
};
