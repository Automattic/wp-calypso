var config = require( 'config' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	var dependencies = '',
		loadSection = '',
		sectionLoaders = '';

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

		loadSection = sections.map( function( section ) {
			return ensureTemplate( section.name );
		} ).join( ' ' );

		sectionLoaders = sections.map( function( section ) {
			return section.paths.map( function( path ) {
				return splitTemplate( path, section.module, section.name );
			} )
		} ).reduce( function( acc, section ) { return acc.concat( section ); }, [] );
	} else {
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
	return sections.map( function( section ) {
		return requireTemplate( section.module );
	} ).join( '' );
}

function splitTemplate( path, module, chunkName ) {
	var regex, result;
	if ( path === '/' ) {
		path = JSON.stringify( path );
	} else {
		regex = utils.pathToRegExp( path );
		path = '/' + utils.regExpToString( regex.toString().slice( 1, -1 ) ) + '/';
	}

	result = [
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
	];

	return result.join( '\n' );
}

function requireTemplate( module ) {
	return 'require( ' + JSON.stringify( module ) + ' )();\n';
}

function ensureTemplate( chunkName ) {
	return [
		'case ' + JSON.stringify( chunkName ) + ':',
		'	return require.ensure([], function() {}, ' + JSON.stringify( chunkName ) + ' );',
		'	break;'
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

