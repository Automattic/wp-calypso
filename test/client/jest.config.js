const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	rootDir: path.join( __dirname, '../../client' ),
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	testPathIgnorePatterns: [
		...base.testPathIgnorePatterns,
		'<rootDir>/server/',
		'<rootDir>/dashboard/',
	],

	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/server/config/index.js',
		'^react-markdown$': '<rootDir>/../test/mocks/react-markdown.js',
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!(@fnando[\\/\\\\]|@vgs[\\/\\\\].*|@wordpress[\\/\\\\]theme[\\/\\\\]|(?:.*[\\/\\\\])?uuid[\\/\\\\]|(?:.*[\\/\\\\])?marked[\\/\\\\]|(?:d3-(?:array|color|format|interpolate|scale|time|time-format)|internmap)[\\/\\\\])|.*\\.(?:gif|jpg|jpeg|png|svg|webp|scss|mp4|sass|css)$)',
	],
	testEnvironmentOptions: {
		url: 'https://example.com',
	},
	setupFiles: [
		...base.setupFiles,
		'jest-canvas-mock',
		'<rootDir>/../test/client/setup-globals.js',
	],
	setupFilesAfterEnv: [
		...base.setupFilesAfterEnv,
		'<rootDir>/../test/client/setup-test-framework.js',
	],
	globals: {
		google: {},
		__i18n_text_domain__: 'default',
	},
};
