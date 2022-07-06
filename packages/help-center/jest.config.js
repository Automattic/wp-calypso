module.exports = {
	preset: '../../test/packages/jest-preset.js',
	setupFiles: [ '<rootDir>/jestSetup.ts' ],
	testEnvironment: 'jsdom',
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
	transformIgnorePatterns: [ 'node_modules/(?!react-native|react-navigation)/' ],
};
