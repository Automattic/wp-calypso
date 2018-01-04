/*eslint-disable no-var */
var config = require( 'config' ),
	page = require( 'page' ),
	sectionsUtils = require( 'lib/sections-utils' ),
	controller = require( 'controller' );

var sections = /*___SECTIONS_DEFINITION___*/[];

function load( sectionName ) {
	switch ( sectionName ) { //eslint-disable-line no-empty
		/*___LOADERS___*/
	}
}

function createPageDefinition( path, sectionDefinition ) {
	var pathRegex = sectionsUtils.pathToRegExp( path );

	page( pathRegex, function( context, next ) {
		var envId = sectionDefinition.envId;
		if ( envId && envId.indexOf( config( 'env_id' ) ) === -1 ) {
			return next();
		}
		controller.setSection( sectionDefinition )( context );
		load( sectionDefinition.name )( controller.clientRouter );
		next();
	} );
}

module.exports = {
	get: sectionsUtils.getSectionsFactory( sections ),
	load: sectionsUtils.loadSectionsFactory( sections, createPageDefinition ),
};
