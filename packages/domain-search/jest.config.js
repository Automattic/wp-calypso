module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/src/test/setup.ts' ],
};
