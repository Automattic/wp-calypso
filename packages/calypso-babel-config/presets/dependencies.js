module.exports = () => ( {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				useBuiltIns: 'entry',
				corejs: 3.6,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				// Exclude `web.immediate`: the non-standard setImmediate is unused and needed by no target browser.
				exclude: [ 'transform-typeof-symbol', 'web.immediate' ],
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
