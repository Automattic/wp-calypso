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
					browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'ie >= 11' ],
				},
				exclude: [ 'transform-classes', 'transform-template-literals' ], // transform-classes is added manually later.
				useBuiltIns: 'entry',
				shippedProposals: true, // allows es7 features like Promise.prototype.finally
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
		[
			'@babel/transform-runtime',
			{
				helpers: true,
				polyfill: false,
				regenerator: false,
			},
		],
		isCalypsoClient && './inline-imports.js',
	] ),
	env: {
		test: {
			plugins: [ './server/bundler/babel/babel-lodash-es' ],
		},
	},
	overrides: [
		{
			test: './vendor/gutenberg',
			plugins: [
				[
					'@wordpress/babel-plugin-import-jsx-pragma',
					{
						scopeVariable: 'createElement',
						source: '@wordpress/element',
						isDefault: false,
					},
				],
				[ '@babel/plugin-transform-react-jsx', { pragma: 'createElement' } ],
			],
		},
	],
};

module.exports = config;
