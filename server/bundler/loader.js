var config = require( 'config' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	var dependencies,
		sectionPreLoaders = '',
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
			sectionPreLoaders += getSectionPreLoaderTemplate( section.name );

			section.paths.forEach( function( path ) {
				sectionLoaders += splitTemplate( path, section );
			} );
		} );

		return [
			dependencies,
			'function preload( sectionName ) {',
			'	switch ( sectionName ) {',
			'	' + sectionPreLoaders,
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
		'			console.warn( error );',
		'			LoadingError.retry( ' + sectionNameString + ' );',
		'		} else {',
		'			console.error( error );',
		'			context.store.dispatch( { type: "SECTION_SET", isLoading: false } );',
		'			LoadingError.show( ' + sectionNameString + ' );',
		'		}',
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

function getSectionPreLoaderTemplate( sectionName ) {
	var result = [
		'case ' + JSON.stringify( sectionName ) + ':',
		'	return require.ensure([], function() {}, ' + JSON.stringify( sectionName ) + ' );',
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
