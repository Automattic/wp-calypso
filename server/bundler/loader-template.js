/*eslint-disable no-var */
var config = require( 'config' ),
	page = require( 'page' ),
	controller = require( 'controller' );

var sections = /*___SECTIONS_DEFINITION___*/[];

function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}

	//TODO: Escape path
	return new RegExp( '^' + path + '(/.*)?$' );
}

function load( sectionName ) {
	switch ( sectionName ) { //eslint-disable-line no-empty
		/*___LOADERS___*/
	}
}

function createPageDefinition( path, sectionDefinition ) {
	var pathRegex = pathToRegExp( path );

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
	get: function() {
		return sections;
	},
	load: function() {
		sections.forEach( sectionDefinition => {
			sectionDefinition.paths.forEach( path => createPageDefinition( path, sectionDefinition ) );
		} );
	},
};
