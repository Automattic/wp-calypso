/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [],
	editorPaths = [ '/post', '/page' ];

if ( config.isEnabled( 'manage/custom-post-types' ) ) {
	editorPaths.push( '/edit' );
}

sections.push( {
	name: 'post-editor',
	paths: editorPaths,
	module: 'post-editor',
	group: 'editor',
	secondary: true
} );

module.exports = sections;
