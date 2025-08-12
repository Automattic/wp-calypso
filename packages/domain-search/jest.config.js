module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
