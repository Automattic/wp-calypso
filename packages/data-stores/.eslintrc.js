module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
