module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/**/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	setupFilesAfterEnv: [ '@automattic/calypso-build/jest/mocks/match-media' ],
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
