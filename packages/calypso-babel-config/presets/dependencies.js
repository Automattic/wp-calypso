module.exports = () => ( {
	// see https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
	sourceType: 'unambiguous',
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
			},
		],
	],
	plugins: [ '@babel/transform-runtime' ],
} );
