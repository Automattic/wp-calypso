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
			"\tReactDom = require( 'react-dom' ),",
			"\tLoadingError = require( 'layout/error' ),",
			"\tclasses = require( 'component-classes' );",
			'\n',
			'var _loadedSections = {};'
		].join( '\n' );

		sections.forEach( function( section ) {
			loadSection += singleEnsure( section.name );
			section.paths.forEach( function( path ) {
				sectionLoaders += splitTemplate( path, section.module, section.name );
			} );
		} );
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
	var content = '';

	sections.forEach( function( section ) {
		content += requireTemplate( section.module );
	} );

	return content;
}

function splitTemplate( path, module, chunkName ) {
	var regex, result;
	if ( path === '/' ) {
		path = JSON.stringify( path );
	} else {
		regex = utils.pathToRegExp( path );
		path = '/' + regex.toString().slice( 1, -1 ) + '/';
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
		'			require( ' + JSON.stringify( module ) + ' )( page );',
		'			page( function( context, next ) {',
						// FIXME: Remove the DOM check once we have a proper isomorphic, one tree routing solution.
		'				if ( context.primary && ! document.getElementById( "primary" ).hasChildNodes() ) {',
		'					ReactDom.render(',
		'						context.primary,',
		'						document.getElementById( "primary" )',
		'					);',
		'				}',
		'				next();',
		'			} );',
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
