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
			"\tclasses = require( 'component-classes' ),",
			"\tcontroller = require( 'controller' );",
			'\n',
			'var _loadedSections = {};'
		].join( '\n' );

		sections.forEach( function( section ) {
			loadSection += singleEnsure( section.name );
			section.paths.forEach( function( path ) {
				sectionLoaders += splitTemplate( path, section );
			} );
		} );
	} else {
		dependencies = "var controller = require( 'controller' );\n";
		sectionLoaders = getRequires( sections );
	}

	return [
		dependencies,
		'module.exports = {',
		'	get: function() {',
		'		return ' + JSON.stringify( sections ) + ';',
		'	},',
		'	load: function() {',
		'		' + sectionLoaders,
		'	},',
		'	preload: function( section ) {',
		'		switch ( section ) {',
		'		' + loadSection,
		'		}',
		'	}',
		'};'
	].join( '\n' );
}

function getRequires( sections ) {
	var content = '';

	sections.forEach( function( section ) {
		content += requireTemplate( section.module );
	} );

	return content;
}

function splitTemplate( path, section ) {
	var regex, result,
		mainPath = path.main,
		redirects = path.redirects;

	if ( mainPath === '/' ) {
		mainPath = JSON.stringify( mainPath );
	} else {
		regex = utils.pathToRegExp( mainPath );
		mainPath = '/' + regex.toString().slice( 1, -1 ) + '/';
	}

	result = [
		'page( ' + mainPath + ', function( context, next ) {',
		'	if ( _loadedSections[ ' + JSON.stringify( section.module ) + ' ] ) {',
		'		context.store.dispatch( { type: "SET_SECTION", section: ' + JSON.stringify( section ) + ' } );',
		'		layoutFocus.next();',
		'		return next();',
		'	}',
		'	context.store.dispatch( { type: "SET_SECTION", isLoading: true } );',
		'	require.ensure([], function( require, error ) {',
		'		if ( error ) {',
		'			if ( ! LoadingError.isRetry() ) {',
		'				LoadingError.retry( ' + JSON.stringify( section.name ) + ' );',
		'			} else {',
		'				context.store.dispatch( { type: "SET_SECTION", isLoading: false } );',
		'				LoadingError.show( ' + JSON.stringify( section.name ) + ' );',
		'			}',
		'			return;',
		'		}',
		'		context.store.dispatch( { type: "SET_SECTION", isLoading: false } );',
		'		context.store.dispatch( { type: "SET_SECTION", section: ' + JSON.stringify( section ) + ' } );',
		'		if ( ! _loadedSections[ ' + JSON.stringify( section.module ) + ' ] ) {',
		'			require( ' + JSON.stringify( section.module ) + ' )( controller.clientRouter );',
		'			_loadedSections[ ' + JSON.stringify( section.module ) + ' ] = true;',
		'		}',
		'		layoutFocus.next();',
		'		next();',
		'	}, ' + JSON.stringify( section.name ) + ' );',
		'} );\n'
	];

	result.push( redirectsTemplate( path.main, redirects ) );

	return result.join( '\n' );
}

function redirectsTemplate( mainPath, redirects ) {
	var result, regex, redirectPath;

	result = redirects.reduce( function( acc, redirect ) {
		regex = utils.pathToRegExp( redirect );
		redirectPath = '/' + regex.toString().slice( 1, -1 ) + '/';

		return acc.concat( [
			'page( ' + redirectPath + ', function( context, next ) {',
			'	page.redirect( "' + mainPath + '" );',
			'} );\n'
		] );
	}, [] );

	return result.join( '\n' );
}

function requireTemplate( module ) {
	return 'require( ' + JSON.stringify( module ) + ' )( controller.clientRouter );\n';
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
