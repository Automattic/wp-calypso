module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/src/test-helpers/setup.ts' ],
};
