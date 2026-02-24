module.exports = {
	preset: '../../test/packages/jest-preset.js',
	roots: [ '<rootDir>/src' ],
	testMatch: [ '<rootDir>/src/**/*.test.{js,ts,tsx}' ],
	modulePathIgnorePatterns: [ '<rootDir>/dist' ],
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@block-notes/(.*)$': '<rootDir>/src/$1',
		'^@automattic/agenttic-client$': '<rootDir>/__mocks__/@automattic/agenttic-client.js',
	},
};
