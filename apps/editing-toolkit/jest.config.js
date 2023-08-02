module.exports = {
	preset: '../../test/apps/jest-preset.js',
	setupFilesAfterEnv: [ require.resolve( './bin/js-unit-setup' ) ],
};
