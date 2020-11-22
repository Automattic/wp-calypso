module.exports = {
	preset: '../../test/packages/jest-preset.js',
	// Node project, no need to transform anything
	transformIgnorePatterns: [ '<rootDir>/', '/node_modules/' ],
};
