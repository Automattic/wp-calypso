/** @format */
const config = require( 'config' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	const templateFile = config.isEnabled( 'code-splitting' )
		? 'loader-template-code-split.js'
		: 'loader-template.js';
	const loaderFactory = config.isEnabled( 'code-splitting' )
		? getSectionPreLoaderTemplate
		: getSectionRequire;

	return fs
		.readFileSync( path.join( __dirname, templateFile ), 'utf8' )
		.replace( '/*___SECTIONS_DEFINITION___*/', JSON.stringify( sections ) + ' || ' )
		.replace( '/*___LOADERS___*/', sections.map( loaderFactory ).join( '\n' ) );
}

function getSectionRequire( section ) {
	return `
		case ${ JSON.stringify( section.name ) }: return require( ${ JSON.stringify( section.module ) } );
	`;
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
