/** @format */
const _ = require( 'lodash' );
const path = require( 'path' );

const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';
const isCalypsoServer = process.env.CALYPSO_SERVER === 'true';
const isCalypso = isCalypsoClient || isCalypsoServer;

const modules = isCalypsoClient ? false : 'commonjs'; // only calypso should keep es6 modules
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

const config = {
	presets: [
		[
			'@babel/env',
			{
				modules,
				targets: {
					browsers: [ 'last 4 Chrome versions' ],
				},
				useBuiltIns: 'usage',
				shippedProposals: true, // allows es7 features like Promise.prototype.finally
			},
		],
		'@babel/react',
	],
	plugins: _.compact( [
		isCalypso && [
			path.join(
				__dirname,
				'server',
				'bundler',
				'babel',
				'babel-plugin-transform-wpcalypso-async'
			),
			{ async: isCalypsoClient && codeSplit },
		],
		'@babel/plugin-proposal-export-default-from',
		'@babel/plugin-proposal-export-namespace-from',
		'@babel/plugin-syntax-dynamic-import',
		isCalypsoClient && './inline-imports.js',
	] ),
	env: {
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [ 'add-module-exports', './server/bundler/babel/babel-lodash-es' ],
		},
	},
};

module.exports = config;
