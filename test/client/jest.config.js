const path = require( 'path' );
const base = require( '@automattic/calypso-jest' );

const shared = {
	...base,
	rootDir: path.join( __dirname, '../../client' ),
	cacheDirectory: path.join( __dirname, '../../.cache/jest' ),
	testPathIgnorePatterns: [ ...base.testPathIgnorePatterns, '<rootDir>/server/' ],

	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/server/config/index.js',
		'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!(@fnando[\\/\\\\]|@vgs[\\/\\\\].*|uuid[\\/\\\\])|.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
	testEnvironmentOptions: {
		url: 'https://example.com',
	},
	setupFiles: [ 'jest-canvas-mock' ],
	globals: {
		google: {},
		__i18n_text_domain__: 'default',
	},
};

module.exports = {
	projects: [
		{
			...shared,
			displayName: 'client',
			testPathIgnorePatterns: [ ...shared.testPathIgnorePatterns, '<rootDir>/dashboard/' ],
			setupFilesAfterEnv: [
				...shared.setupFilesAfterEnv,
				'<rootDir>/../test/client/setup-test-framework.js',
			],
		},
		{
			...shared,
			displayName: 'dashboard',
			// Override testMatch to only run dashboard tests
			testMatch: [ '<rootDir>/dashboard/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
			setupFilesAfterEnv: [
				...shared.setupFilesAfterEnv,
				'<rootDir>/../test/client/setup-dashboard-test-framework.js',
			],
		},
	],
};
