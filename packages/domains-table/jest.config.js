module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testMatch: [ '<rootDir>/**/__tests__/**/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	setupFilesAfterEnv: [
		'@testing-library/jest-dom/extend-expect',
		'@automattic/calypso-build/jest/mocks/match-media',
	],
	transformIgnorePatterns: [ 'node_modules/(?!gridicons)(?!.*\\.svg)' ],
};
