/** @format */
const config = {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/env',
			{
				modules: false,
				targets: { browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'ie >= 11' ] },
				useBuiltIns: 'entry',
				shippedProposals: true, // allows es7 features like Promise.prototype.finally
			},
		],
	],
	// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
	exclude: [ 'transform-typeof-symbol' ],
	plugins: [
		'@babel/plugin-syntax-dynamic-import',
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
