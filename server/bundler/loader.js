const fs = require( 'fs' ),
	utils = require( './utils' ),
	mustache = require( 'mustache' );

function getSectionsModule( sections ) {
	const template = fs.readFileSync( __dirname + '/loader.js.mst', 'utf8' );
	return mustache.render( template.toString(), {
		sectionsString: JSON.stringify( sections ),
		sections: sections
	} );
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
