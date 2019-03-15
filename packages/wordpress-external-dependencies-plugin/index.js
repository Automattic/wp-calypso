const { ExternalsPlugin } = require( 'webpack' );

class WordPressExternalDependenciesPlugin extends ExternalsPlugin {
	constructor() {
		super( 'global', [ wpExternals ] );
	}
}

function wordpressRequire( request ) {
	// @wordpress/components -> [ @wordpress, components ]
	const [ , name ] = request.split( '/' );

	// components -> wp.components
	return `wp.${ name.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() ) }`;
}

function wpExternals( context, request, callback ) {
	return /^@wordpress\//.test( request )
		? callback( null, `root ${ wordpressRequire( request ) }` )
		: callback();
}

module.exports = WordPressExternalDependenciesPlugin;
