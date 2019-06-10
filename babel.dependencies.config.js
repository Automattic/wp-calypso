/** @format */
const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

const config = {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/env',
			{
				modules: false,
				useBuiltIns: 'entry',
				corejs: 2,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
	],
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
		isBrowser && [
			'module-resolver',
			{
				alias: {
					lodash: 'lodash-es',
					'lodash/': ( [ , name ] ) => `lodash-es/${ name }`,
				},
			},
		],
		[
			'@babel/transform-runtime',
			{
				corejs: false, // we polyfill so we don't need core-js
				helpers: true,
				regenerator: false,
				useESModules: false,
			},
		],
	],
};

module.exports = config;
