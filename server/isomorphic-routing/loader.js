function getSectionsModule( sections ) {
	var caseSections = ''
	sections.forEach( function( section ) {
		if ( section.isomorphic ) {
			caseSections += 'case ' + JSON.stringify( section.module ) + ': return require( ' + JSON.stringify( section.module ) + ' );\n';
		}
	} );

	return [
		'module.exports = {',
		'	get: function() {',
		'		return ' + JSON.stringify( sections ) + ';',
		'	},',
		' require: function( module ) {',
		'		switch ( module ) {',
					caseSections,
		'			default:',
		'				return null;',
		'   }',
		' }',
		'};'
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

	return getSectionsModule( sections );
};
