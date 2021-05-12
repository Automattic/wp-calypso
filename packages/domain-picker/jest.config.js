module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/**/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	setupFilesAfterEnv: [ '@testing-library/jest-dom/extend-expect' ],
};
