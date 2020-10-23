module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	cacheDirectory: '<rootDir>/../../.cache/jest',
	globals: {
		__i18n_text_domain__: 'default',
	},
};
