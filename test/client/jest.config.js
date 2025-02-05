const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

module.exports = {
	...base,
	rootDir: '../../client',
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	testPathIgnorePatterns: [ '<rootDir>/server/' ],

	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/server/config/index.js',
		'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
		'^@wordpress/upload-media$': '<rootDir>/__mocks__/upload-media.js',
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
	testEnvironmentOptions: {
		url: 'https://example.com',
	},
	setupFiles: [ 'jest-canvas-mock' ],
	setupFilesAfterEnv: [ '<rootDir>/../test/client/setup-test-framework.js' ],
	globals: {
		google: {},
		__i18n_text_domain__: 'default',
	},
};
