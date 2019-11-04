const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

// Use commonjs for Node
const modules = isBrowser ? false : 'commonjs';
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = {
	presets: [ [ '@automattic/calypso-build/babel/default', { modules } ] ],
	plugins: [ [ '@automattic/transform-wpcalypso-async', { async: isBrowser && codeSplit } ] ],
	env: {
		build_pot: {
			plugins: [
				[
					'@automattic/babel-plugin-i18n-calypso',
					{
						dir: 'build/i18n-calypso/',
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
				],
			],
		},
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [ 'add-module-exports', 'babel-plugin-dynamic-import-node' ],
		},
	},
};

module.exports = config;
