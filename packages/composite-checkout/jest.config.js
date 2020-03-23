module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	testEnvironment: 'jsdom',
	globals: { window: { navigator: { userAgent: 'jest' } } },
};
