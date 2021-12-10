const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	rootDir: '../../client/server',
	transformIgnorePatterns: [ 'node_modules/(?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)' ],
	moduleNameMapper: {
		'^@automattic/calypso-config$': 'calypso/server/config',
		'^@automattic/calypso-config/(.*)$': 'calypso/server/config/$1',
	},
	setupFilesAfterEnv: [ require.resolve( './setup-test-framework.js' ) ],
};
