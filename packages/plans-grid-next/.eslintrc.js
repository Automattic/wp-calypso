module.exports = {
	env: {
		browser: true,
	},
	overrides: [
		{
			// These are consumed only by Calypso's webpack build, it is ok to import other Calypso components
			files: [ '**/docs/example.jsx', '*.md.js', '*.md.jsx' ],
			rules: {
				'no-restricted-imports': 'off',
			},
		},
	],
};
