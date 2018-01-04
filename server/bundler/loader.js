/** @format */
const config = require( 'config' ),
	fs = require( 'fs' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	let sectionLoaders = '';

	if ( config.isEnabled( 'code-splitting' ) ) {
		return fs
			.readFileSync( __dirname + '/loader-template-code-split.js', 'utf8' )
			.replace( '___SECTIONS_DEFINITION___', JSON.stringify( sections ) )
			.replace( '___LOADERS___', sections.map( getSectionPreLoaderTemplate ).join( '\n' ) );
	}

	const dependencies = [
		"var config = require( 'config' ),",
		"\tpage = require( 'page' ),",
		"\tcontroller = require( 'controller' );\n",
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
		'};',
	].join( '\n' );
}

function getRequires( sections ) {
	let content = '';

	sections.forEach( function( section ) {
		content += requireTemplate( section );
	} );

	return content;
}

function getPathRegex( pathString ) {
	if ( pathString === '/' ) {
		return JSON.stringify( pathString );
	}
	const regex = utils.pathToRegExp( pathString );
	return '/' + regex.toString().slice( 1, -1 ) + '/';
}

function requireTemplate( section ) {
	const result = section.paths.reduce( function( acc, path ) {
		const pathRegex = getPathRegex( path );

		return acc.concat( [
			'page( ' + pathRegex + ', function( context, next ) {',
			'	var envId = ' + JSON.stringify( section.envId ) + ';',
			'	if ( envId && envId.indexOf( config( "env_id" ) ) === -1 ) {',
			'		return next();',
			'	}',
			'	controller.setSection( ' + JSON.stringify( section ) + ' )( context );',
			'	require( ' + JSON.stringify( section.module ) + ' )( controller.clientRouter );',
			'	next();',
			'} );\n',
		] );
	}, [] );

	return result.join( '\n' );
}

function getSectionPreLoaderTemplate( section ) {
	const sectionNameString = JSON.stringify( section.name );
	let cssLoader = '';

	if ( section.css ) {
		cssLoader = `loadCSS( ${ sectionNameString } );`;
	}

	return `
		case ${ sectionNameString }:
			${ cssLoader }
			return import( /* webpackChunkName: ${ sectionNameString } */ '${ section.module }' );
`;
}

function sectionsWithCSSUrls( sections ) {
	return sections.map( section =>
		Object.assign(
			{},
			section,
			section.css && {
				css: {
					id: section.css,
					urls: utils.getCssUrls( section.css ),
				},
			}
		)
	);
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
