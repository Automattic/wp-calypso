const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	testEnvironment: 'jsdom',
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
	setupFiles: [ 'jest-canvas-mock' ],
	// This includes a lot of globals that don't exist, like fetch, matchMedia, etc.
	setupFilesAfterEnv: [ require.resolve( '../client/setup-test-framework.js' ) ],
};
