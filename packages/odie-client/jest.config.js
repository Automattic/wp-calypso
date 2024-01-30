module.exports = {
	preset: '../../test/packages/jest-preset.js',
	setupFiles: [ '<rootDir>/jestSetup.ts' ],
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/**/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
