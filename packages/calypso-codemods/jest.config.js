module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testMatch: [ '<rootDir>/tests/*/codemod.spec.js' ],
	setupFiles: [ '<rootDir>/setup-tests.js' ],
};
