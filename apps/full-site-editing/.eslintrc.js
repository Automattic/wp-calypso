module.exports = {
	plugins: [ 'jest' ],
	extends: [ 'plugin:jest/recommended' ],
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'react/react-in-jsx-scope': 0,
	},
};
