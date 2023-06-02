module.exports = {
	preset: '../../test/packages/jest-preset.js',
	setupFiles: [ '<rootDir>/jestSetup.ts' ],
	testEnvironment: 'jsdom',
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
