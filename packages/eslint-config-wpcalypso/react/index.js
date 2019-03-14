/** @format */

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
		'react/jsx-curly-spacing': [ 2, 'always' ],
		'react/jsx-no-duplicate-props': 2,
		'react/jsx-no-target-blank': 2,
		'react/jsx-no-undef': 2,
		'react/jsx-tag-spacing': 2,
		'react/jsx-uses-react': 2,
		'react/jsx-uses-vars': 2,
		'react/no-danger': 2,
		'react/no-deprecated': 2,
		'react/no-did-mount-set-state': 2,
		'react/no-did-update-set-state': 2,
		'react/no-is-mounted': 2,
		'react/no-string-refs': 2,
		'react/prefer-es6-class': 2,
		'react/react-in-jsx-scope': 2,
		'react-hooks/rules-of-hooks': 2,
		'react-hooks/exhaustive-deps': 1,
	},
};
