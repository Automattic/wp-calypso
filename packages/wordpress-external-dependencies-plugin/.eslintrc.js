module.exports = {
	parserOptions: {
		sourceType: 'script', // force require over import
	},
	rules: {
		'import/no-nodejs-modules': 0,
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
