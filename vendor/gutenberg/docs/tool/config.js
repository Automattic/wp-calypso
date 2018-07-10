/**
 * External dependencies
 */
const glob = require( 'glob' ).sync;
const path = require( 'path' );

const root = path.resolve( __dirname, '../../' );

// These are packages published to NPM as their own node modules.
const npmReadyPackages = glob( 'packages/*/package.json' )
	.map( ( fileName ) => fileName.split( '/' )[ 1 ] );

// These are internal-only packages (for now), not yet published as standalone
// node modules.
const gutenbergPackages = [
	'blocks',
	'components',
	'core-blocks',
	'edit-post',
	'editor',
	'nux',
	'utils',
	'viewport',
];

module.exports = {
	dataNamespaces: {
		core: {
			title: 'WordPress Core Data',
			// TODO: Figure out a way to generate docs for dynamic actions/selectors
			selectors: [ path.resolve( root, 'packages/core-data/src/selectors.js' ) ],
			actions: [ path.resolve( root, 'packages/core-data/src/actions.js' ) ],
		},
		'core/blocks': {
			title: 'Block Types Data',
			selectors: [ path.resolve( root, 'blocks/store/selectors.js' ) ],
			actions: [ path.resolve( root, 'blocks/store/actions.js' ) ],
		},
		'core/editor': {
			title: 'The Editor\'s Data',
			selectors: [ path.resolve( root, 'editor/store/selectors.js' ) ],
			actions: [ path.resolve( root, 'editor/store/actions.js' ) ],
		},
		'core/edit-post': {
			title: 'The Editor\'s UI Data',
			selectors: [ path.resolve( root, 'edit-post/store/selectors.js' ) ],
			actions: [ path.resolve( root, 'edit-post/store/actions.js' ) ],
		},
		'core/viewport': {
			title: 'The viewport module Data',
			selectors: [ path.resolve( root, 'viewport/store/selectors.js' ) ],
			actions: [ path.resolve( root, 'viewport/store/actions.js' ) ],
		},
		'core/nux': {
			title: 'The NUX (New User Experience) module Data',
			selectors: [ path.resolve( root, 'nux/store/selectors.js' ) ],
			actions: [ path.resolve( root, 'nux/store/actions.js' ) ],
		},
	},
	dataDocsOutput: path.resolve( __dirname, '../data' ),

	packages: {
		...npmReadyPackages.reduce( ( memo, packageName ) => {
			memo[ packageName ] = { isNpmReady: true };
			return memo;
		}, {} ),
		...gutenbergPackages.reduce( ( memo, packageName ) => {
			memo[ packageName ] = { isNpmReady: false };
			return memo;
		}, {} ),
	},

	rootManifest: path.resolve( __dirname, '../root-manifest.json' ),
	manifestOutput: path.resolve( __dirname, '../manifest.json' ),
};
