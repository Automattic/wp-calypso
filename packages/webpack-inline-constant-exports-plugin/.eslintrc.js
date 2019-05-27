module.exports = {
	parserOptions: {
		sourceType: 'script', // no import, only require
	},
	rules: {
		'import/no-nodejs-modules': 0,
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
