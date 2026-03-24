module.exports = {
	preset: '../../test/packages/jest-preset.js',
	setupFiles: [ '<rootDir>/jestSetup.ts' ],
	testEnvironment: 'jsdom',
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
	moduleNameMapper: {
		// @automattic/onboarding pulls in @wordpress/react-i18n which crashes at
		// module-evaluation time in Jest (__ is undefined).  Map it to a stub.
		'^@automattic/onboarding$': '<rootDir>/src/test/__mocks__/automattic-onboarding.js',
		// @automattic/data-stores pulls in @automattic/calypso-products →
		// @automattic/components → @wordpress/rich-text, which calls
		// combineReducers() before @wordpress/data is ready.
		'^@automattic/data-stores$': '<rootDir>/src/test/__mocks__/automattic-data-stores.js',
		// @automattic/zendesk-client → @automattic/agenttic-ui (not installed).
		'^@automattic/zendesk-client$': '<rootDir>/src/test/__mocks__/automattic-zendesk-client.js',
		// @automattic/calypso-products and @automattic/components both chain into
		// @wordpress/rich-text → combineReducers crash.
		'^@automattic/calypso-products$': '<rootDir>/src/test/__mocks__/automattic-calypso-products.js',
		'^@automattic/components$': '<rootDir>/src/test/__mocks__/automattic-components.js',
	},
};
