module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	globals: { window: { navigator: { userAgent: 'jest' } } },
};
