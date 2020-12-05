module.exports = {
	extends: '../index.js',
	parserOptions: {
		ecmaVersion: 7,
		ecmaFeatures: {
			jsx: true,
		},
		sourceType: 'module',
	},
	plugins: [ 'react', 'react-hooks', 'wpcalypso' ],
	rules: {
		'react/jsx-boolean-value': [ 'error', 'never' ],
		'react/jsx-no-duplicate-props': 'error',
		'react/jsx-no-target-blank': 'error',
		'react/jsx-no-undef': 'error',
		'react/jsx-uses-react': 'error',
		'react/jsx-uses-vars': 'error',
		'react/no-danger': 'error',
		'react/no-deprecated': 'error',
		'react/no-did-mount-set-state': 'error',
		'react/no-did-update-set-state': 'error',
		'react/no-is-mounted': 'error',
		'react/no-string-refs': 'error',
		'react/prefer-es6-class': 'error',
		'react/react-in-jsx-scope': 'error',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
	},
};
