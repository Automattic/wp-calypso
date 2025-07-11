module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	globals: {
		configData: {},
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!@fnando[\\/\\\\]|.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
};
