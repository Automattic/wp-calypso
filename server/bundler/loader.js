/** @format */
const config = require( 'config' ),
	fs = require( 'fs' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	if ( config.isEnabled( 'code-splitting' ) ) {
		return fs
			.readFileSync( __dirname + '/loader-template-code-split.js', 'utf8' )
			.replace( '/*___SECTIONS_DEFINITION___*/', JSON.stringify( sections ) + ' || ' )
			.replace( '/*___LOADERS___*/', sections.map( getSectionPreLoaderTemplate ).join( '\n' ) );
	}

	return fs
		.readFileSync( __dirname + '/loader-template.js', 'utf8' )
		.replace( '/*___SECTIONS_DEFINITION___*/', JSON.stringify( sections ) + ' || ' )
		.replace( '/*___LOADERS___*/', sections.map( getSectionRequire ).join( '\n' ) );
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
