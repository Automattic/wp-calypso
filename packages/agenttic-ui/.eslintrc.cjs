module.exports = {
	rules: {
		// Calypso's root config turns this off for packages, which rely on a
		// compile-time __i18n_text_domain__ constant. These packages don't —
		// they ship a literal domain — so keep the check they arrived with.
		'@wordpress/i18n-text-domain': [
			'error',
			{ allowedTextDomain: 'a8c-agenttic' },
		],
	},
	overrides: [
		{
			files: [ '**/*.stories.*', '**/stories/**', '**/__stories__/**' ],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
