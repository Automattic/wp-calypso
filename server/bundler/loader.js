const config = require( 'config' ),
	fs = require( 'fs' ),
	utils = require( './utils' ),
	Handlebars = require( 'handlebars' );

Handlebars.registerHelper( 'json', function( context ) {
	return context && JSON.stringify( context ) || 'undefined';
} );

function getSectionsModule( sections ) {
	let templateName;
	if ( config.isEnabled( 'code-splitting' ) ) {
		templateName = 'loader-code-splitting.js.mst';
	} else {
		templateName = 'loader.js.mst';
	}

	const source = fs.readFileSync( __dirname + '/' + templateName, 'utf8' );
	const template = Handlebars.compile( source.toString() );
	return template( { sections: sections } );
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
