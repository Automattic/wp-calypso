module.exports = {
	preset: '../../test/packages/jest-preset.js',
	globals: {
		configData: {},
	},
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
	moduleNameMapper: {
		'^@wordpress/upload-media$': '<rootDir>/src/__mocks__/index.js',
	},
};
