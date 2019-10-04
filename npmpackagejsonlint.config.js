module.exports = {
	// See https://www.npmjs.com/package/@wordpress/npm-package-json-lint-config
	extends: '@wordpress/npm-package-json-lint-config',
	rules: {
		'prefer-no-devDependencies': 'error',
		'prefer-property-order': 'off',
		'require-author': 'error',
		'require-bugs': 'off',
		'require-homepage': 'off',
		'require-keywords': 'off',
		'require-license': 'error',
		'require-name': 'error',
		'require-version': 'error',
		'valid-values-author': [ 'error', [ 'Automattic Inc.' ] ],
		'valid-values-license': [ 'error', [ 'GPL-2.0-or-later' ] ],
		'valid-values-name-scope': [ 'error', [ '@automattic' ] ],
	},
	overrides: [
		{
			patterns: [
				'/package.json',
				'packages/eslint-config-wpcalypso/package.json',
				'packages/eslint-plugin-wpcalypso/package.json',
				'packages/i18n-calypso/package.json',
				'packages/photon/package.json',
			],
			rules: {
				'valid-values-name-scope': 'off',
			},
		},
		{
			patterns: [
				'/apps/full-site-editing/package.json',
				'/apps/wpcom-block-editor/package.json',
				'/package.json',
			],
			rules: {
				'prefer-no-devDependencies': 'off',
			},
		},
		{
			patterns: [ 'packages/material-design-icons/package.json' ],
			rules: {
				'valid-values-license': 'off',
			},
		},
	],
};
