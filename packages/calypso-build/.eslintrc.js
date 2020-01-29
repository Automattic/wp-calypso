module.exports = {
	parserOptions: {
		sourceType: 'script', // force the cli to use require instead of import, which it should be to node compatible
	},
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
