/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [];

if ( config.isEnabled( 'reader' ) ) {
	const readerPaths = [
		'/',
		'/read'
	];

	sections.push( {
		name: 'reader',
		paths: readerPaths,
		module: 'reader',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-post-recomendations',
		paths: [ '/recommendations/posts' ],
		module: 'reader/recommendations',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-recomendations',
		paths: [ '/recommendations' ],
		module: 'reader/recommendations',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'discover',
		paths: [ '/discover' ],
		module: 'reader/discover',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-following',
		paths: [ '/following' ],
		module: 'reader/following',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-tags',
		paths: [ '/tags', '/tag' ],
		module: 'reader/tag-stream',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-activities',
		paths: [ '/activities' ],
		module: 'reader/liked-stream',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-search',
		paths: [ '/read/search' ],
		module: 'reader/search',
		secondary: true,
		group: 'reader'
	} );

	sections.push( {
		name: 'reader-list',
		paths: [ '/read/list' ],
		module: 'reader/list',
		secondary: true,
		group: 'reader'
	} );

	if ( config.isEnabled( 'reader/start' ) ) {
		sections.push( {
			name: 'reader-start',
			paths: [ '/read/start' ],
			module: 'reader/start',
			secondary: true,
			group: 'reader'
		} );
	}
}

module.exports = sections;
