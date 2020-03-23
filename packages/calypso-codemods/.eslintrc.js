module.exports = {
	rules: {
		'import/no-nodejs-modules': 'off',
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
};
