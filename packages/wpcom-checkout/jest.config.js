module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	globals: {
		configData: {},
	},
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
