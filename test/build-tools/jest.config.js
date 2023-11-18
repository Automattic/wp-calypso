const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	rootDir: '../../build-tools',
	testPathIgnorePatterns: [ '.test.' ], // Files with .test. in the name will be tested with Bun
};
