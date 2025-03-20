const path = require( 'path' );
const helpCenterDir = '/Users/dev/dev/wp-calypso/apps/help-center';

module.exports = function ( source ) {
	// Top-level directory must be help-center
	if ( path.dirname( this.resourcePath ) !== helpCenterDir ) {
		return source;
	}

	const fileName = path.basename( this.resourcePath );

	// File must start with 'help-center-'
	if ( ! fileName.startsWith( 'help-center-' ) ) {
		return source;
	}

	// Skip help-center-wp-admin-disconnected.js
	if ( fileName === 'help-center-wp-admin-disconnected.js' ) {
		return source;
	}

	console.log( 'ADD: ', this.resourcePath );
	// Prepend the magic comment to the source code.
	const magicComment = '/* wp:polyfill */\n';
	return magicComment + source;
};
