const preset = require( '../../test/apps/jest-preset.js' );

module.exports = {
	...preset,
	setupFilesAfterEnv: [ ...preset.setupFilesAfterEnv, require.resolve( './jest.setup.js' ) ],
};
