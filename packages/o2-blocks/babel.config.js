module.exports = {
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
    plugins: [
        [
            '@wordpress/import-jsx-pragma',
            {
                scopeVariable: 'createElement',
                source: '@wordpress/element',
                isDefault: false,
            },
        ],
        [
            '@babel/transform-react-jsx',
            {
                pragma: 'createElement',
            },
        ],
    ],
    env: {
		build_pot: {
			plugins: [
				[
					'@wordpress/babel-plugin-makepot',
					{
						output: 'build/i18n-calypso/gutenberg-strings.pot',
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
                ],
            ],
        },
    },
};