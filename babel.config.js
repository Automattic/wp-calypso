/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';

const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

const config = {
	babelrcRoots: path.join( __dirname, 'packages', '*' ), // Needed for Jest
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	plugins: _.compact( [
		[
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-wpcalypso-async'
			),
			{ async: isCalypsoClient && codeSplit },
		],
		isCalypsoClient && './inline-imports.js',
	] ),
	env: {
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [
				'add-module-exports',
				'babel-plugin-dynamic-import-node',
				'./server/bundler/babel/babel-lodash-es',
			],
		},
	},
};

module.exports = config;
