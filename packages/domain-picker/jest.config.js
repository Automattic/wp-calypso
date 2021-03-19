module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__test__/**/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	setupFilesAfterEnv: [ '@testing-library/jest-dom/extend-expect' ],
};
