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
					browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'not ie <= 10' ],
				},
				exclude: [ 'transform-classes', 'transform-template-literals' ], // transform-classes is added manually later.
			},
		],
		'@babel/stage-2',
		'@babel/react',
	],
	plugins: _.compact( [
		// the two class transforms are to emulate exactly how babel 6 handled classes.
		// it very slightly diverges from spec but also is more concise.
		// see: http://new.babeljs.io/docs/en/next/v7-migration.html#babel-plugin-proposal-class-properties
		[ '@babel/plugin-proposal-class-properties', { loose: true } ],
		[ '@babel/plugin-transform-classes', { loose: false } ],
		[ '@babel/plugin-transform-template-literals', { loose: true } ],
		! isCalypso && 'add-module-exports',
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
		'@babel/transform-runtime',
		[
			'transform-imports',
			{
				'state/selectors': {
					transform: 'state/selectors/${member}',
					kebabCase: true,
				},
			},
		],
		isCalypsoClient && './inline-imports.js', // inline-imports can only occur after transform-imports
	] ),
	env: {
		test: {
			plugins: [
				'./server/bundler/babel/babel-lodash-es',
				[ 'transform-builtin-extend', { globals: [ 'Error' ] } ],
			],
		},
	},
};

module.exports = config;
