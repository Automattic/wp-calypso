const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';

// We implicitly use browserslist configuration in package.json for build targets.

const babelConfig = {
	presets: [ '@automattic/calypso-build/babel/default' ],
	plugins: [ [ '@automattic/transform-wpcalypso-async', { async: true, ignore: ! isBrowser } ] ],
	env: {
		production: {
			plugins: [ 'babel-plugin-transform-react-remove-prop-types' ],
		},
		build_pot: {
			plugins: [
				[
					'@automattic/babel-plugin-i18n-calypso',
					{
						dir: 'build/i18n-calypso/',
						headers: {
							'content-type': 'text/plain; charset=UTF-8',
							'x-generator': 'calypso',
						},
					},
				],
			],
		},
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [ 'babel-plugin-dynamic-import-node' ],
		},
	},
};

module.exports = babelConfig;
