/**
 * This config is a port of https://github.com/tclindner/npm-package-json-lint-config-default
 */
module.exports = {
	parser: require.resolve( '../parser.js' ),
	extends: [ 'plugin:json-es/recommended' ],
	plugins: [ 'eslint-plugin-json-es' ],
	rules: {
		// JSON doesn't allow dangle comma or comments
		'comma-dangle': 'off',
		'json-es/no-comments': 'error',
	},
	overrides: [
		{
			files: [ 'package.json' ],
			plugins: [ '@automattic/eslint-plugin-json' ],
			rules: {
				'@automattic/json/bin-type': 'error',
				'@automattic/json/config-type': 'error',
				'@automattic/json/cpu-type': 'error',
				'@automattic/json/dependencies-type': 'error',
				'@automattic/json/description-type': 'error',
				'@automattic/json/devDependencies-type': 'error',
				'@automattic/json/directories-type': 'error',
				'@automattic/json/engines-type': 'error',
				'@automattic/json/files-type': 'error',
				'@automattic/json/homepage-type': 'error',
				'@automattic/json/keywords-type': 'error',
				'@automattic/json/license-type': 'error',
				'@automattic/json/main-type': 'error',
				'@automattic/json/man-type': 'error',
				'@automattic/json/name-type': 'error',
				'@automattic/json/optionalDependencies-type': 'error',
				'@automattic/json/os-type': 'error',
				'@automattic/json/peerDependencies-type': 'error',
				'@automattic/json/preferGlobal-type': 'error',
				'@automattic/json/private-type': 'error',
				'@automattic/json/repository-type': 'error',
				'@automattic/json/scripts-type': 'error',
				'@automattic/json/version-type': 'error',

				// Formatting
				'@automattic/json/description-format': [
					'error',
					{
						requireCapitalFirstLetter: true,
						requireEndingPeriod: true,
					},
				],
				'@automattic/json/version-format': 'error',
				'@automattic/json/name-format': 'error',

				// Required fields
				'@automattic/json/require-author': 'error',
				'@automattic/json/require-description': 'error',
				'@automattic/json/require-license': 'error',
				'@automattic/json/require-name': 'error',
				'@automattic/json/require-version': 'error',
			},
		},
	],
};
