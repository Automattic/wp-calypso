module.exports = {
	rules: {
		// src/common is the pure shared layer: data in, data out. It must stay
		// consumable by every host (panel, dashboard, widgets.wp.com iframe), so
		// no UI, state, or i18n dependency may creep in.
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'react',
							'react-dom',
							'react-redux',
							'redux',
							'redux-*',
							'@wordpress/*',
							'i18n-calypso',
							'calypso/*',
							'../app/*',
							'../panel/*',
							'**/src/app/*',
							'**/src/panel/*',
						],
						message:
							'src/common must stay pure: no React, Redux, @wordpress, i18n, or app/panel imports.',
					},
				],
			},
		],
	},
};
