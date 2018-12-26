/** @format */

module.exports = {
	parserOptions: {
		sourceType: 'script',
	},
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
