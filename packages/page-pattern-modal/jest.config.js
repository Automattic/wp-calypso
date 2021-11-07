module.exports = {
	preset: '../../test/packages/jest-preset.js',
	globals: {
		configData: {},
	},
	setupFilesAfterEnv: [ 'jest-canvas-mock' ],
};
