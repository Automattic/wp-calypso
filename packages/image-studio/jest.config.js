module.exports = {
	preset: '../../test/packages/jest-preset.js',
	roots: [ '<rootDir>/src' ],
	testMatch: [ '<rootDir>/src/**/*.test.{js,ts,tsx}' ],
	modulePathIgnorePatterns: [ '<rootDir>/dist' ],
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@wordpress/data$': '<rootDir>/src/__mocks__/@wordpress/data.ts',
		'^@wordpress/core-data$': '<rootDir>/src/__mocks__/@wordpress/core-data.ts',
		'^@wordpress/block-editor$': '<rootDir>/src/__mocks__/@wordpress/block-editor.ts',
		'^@wordpress/media-utils$': '<rootDir>/src/__mocks__/@wordpress/media-utils.ts',
		'\\.(webp|png|jpe?g|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
	},
};
