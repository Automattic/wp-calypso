module.exports = {
	presets: [
		[
			'@babel/env',
			{
				useBuiltIns: 'usage',
				corejs: 2,
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
	],
	plugins: [ '@babel/transform-runtime' ],
};
