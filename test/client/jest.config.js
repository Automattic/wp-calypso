const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );
module.exports = {
	...base,
	rootDir: '../../client',
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	testPathIgnorePatterns: [ '<rootDir>/server/' ],

	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/server/config/index.js',
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
	testURL: 'https://example.com',
	setupFilesAfterEnv: [ '<rootDir>/../test/client/setup-test-framework.js' ],
	globals: {
		google: {},
	},
};
