module.exports = {
	env: {
		browser: true,
	},
	globals: {
		chrome: 'readonly',
	},
	rules: {
		// Sidebar uses placeholder href="#" links for static nav UI in the Chrome extension
		'jsx-a11y/anchor-is-valid': 'off',
	},
};
