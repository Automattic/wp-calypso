var config = require( 'config' ),
	fs = require ( 'fs' ),
	utils = require( './utils' );

function getSectionsModule( sections ) {
	const sectionsLoaders = sections.map( section => {
		return `case '${ section.name }':\n\treturn import( /* webpackChunkName: ${ JSON.stringify( section.name ) } */ '${ section.module }' );`
	} ).join( '\n' );

	return fs.readFileSync( __dirname  + '/loader_template.js', 'utf8' )
		.replace( "___DEFINITION___", JSON.stringify( sections ) )
		.replace( "___LOADERS___", sectionsLoaders );
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
