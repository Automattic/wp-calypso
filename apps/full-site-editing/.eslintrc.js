module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'react/react-in-jsx-scope': 0,
	},
};
