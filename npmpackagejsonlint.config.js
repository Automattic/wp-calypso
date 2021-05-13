module.exports = {
	// See https://www.npmjs.com/package/@wordpress/npm-package-json-lint-config
	extends: '@wordpress/npm-package-json-lint-config',
	rules: {
		'prefer-no-devDependencies': 'error',
		'prefer-property-order': 'off',
		'require-bugs': 'off',
		'require-homepage': 'off',
		'require-keywords': 'off',
		'valid-values-author': [ 'error', [ 'Automattic Inc.' ] ],
		'valid-values-name-scope': [ 'error', [ '@automattic' ] ],
	},
	overrides: [
		{
			patterns: [ './package.json' ],
			rules: {
				'prefer-no-devDependencies': 'off',
			},
		},
		{
			patterns: [
				'./package.json',
				'./client/package.json',
				'./packages/calypso-codemods/package.json',
				'./packages/eslint-plugin-wpcalypso/package.json',
				'./packages/i18n-calypso-cli/package.json',
				'./packages/i18n-calypso/package.json',
				'./packages/photon/package.json',
			],
			rules: {
				'valid-values-name-scope': 'off',
			},
		},
		{
			patterns: [ './packages/material-design-icons/package.json' ],
			rules: {
				'valid-values-license': 'off',
			},
		},
	],
};
