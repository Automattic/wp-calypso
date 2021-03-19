module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '@testing-library/jest-dom/extend-expect' ],
};
