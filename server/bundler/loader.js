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
			'preloadHub.on( "preload", preload );',
			'\n',
			'function continueToNext( context, section ) {',
			'	if ( section.envId && section.envId.indexOf( config( "env_id" ) ) === -1 ) {',
			'		return true;',
			'	}',
			'	if ( _loadedSections[ section.module ] ) {',
			'		controller.setSection( section )( context );',
			'		context.store.dispatch( activateNextLayoutFocus() );',
			'		return true;',
			'	}',
			'   return false',
			'}',
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
		result;

	result = [
		'page( ' + pathRegex + ', function( context, next ) {',
		'	var section = ' + sectionString + ';',
		'	if ( continueToNext( context, section ) ) {',
		'		return next();',
		'	}',
		'	if ( config.isEnabled( "restore-last-location" ) && restoreLastSession( context.path ) ) {',
		'		return;',
		'	}',
		'	context.store.dispatch( { type: "SECTION_SET", isLoading: true } );',
		'	require.ensure([], function( require ) {',
		'		context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
		'		controller.setSection( ' + sectionString + ' )( context );',
		'		if ( ! _loadedSections[ ' + moduleString + ' ] ) {',
		'			require( ' + moduleString + ' )( controller.clientRouter );',
		'			_loadedSections[ ' + moduleString + ' ] = true;',
		'		}',
		'		context.store.dispatch( activateNextLayoutFocus() );',
		'		next();',
		'	}, function onError( error ) {',
		'		if ( ! LoadingError.isRetry() ) {',
		'			LoadingError.retry( ' + sectionNameString + ' );',
		'		} else {',
		'			console.error(error);',
		'			context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
		'			LoadingError.show( ' + sectionNameString + ' );',
		'		}',
		'		return;',
		'	},',
		sectionNameString + ' );',
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
