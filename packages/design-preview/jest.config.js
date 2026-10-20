module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/**/*.[jt]s?(x)' ],
	setupFilesAfterEnv: [ '@automattic/calypso-build/jest/mocks/match-media' ],
};
