module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testMatch: [ '<rootDir>/test/**/*.{ts,tsx}' ],
	testEnvironment: 'jsdom',
	globals: { window: { navigator: { userAgent: 'jest' } } },
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
	// This includes a lot of globals that don't exist, like fetch, matchMedia, etc.
	setupFilesAfterEnv: [ require.resolve( '../../test/client/setup-test-framework.js' ) ],
};
