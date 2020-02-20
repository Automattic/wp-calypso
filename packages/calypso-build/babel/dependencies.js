module.exports = () => ( {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/env',
			{
				modules: false,
				useBuiltIns: 'entry',
				corejs: 3.6,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
	],
	plugins: [
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
} );
