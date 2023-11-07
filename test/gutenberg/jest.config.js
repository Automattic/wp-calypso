module.exports = {
	setupFilesAfterEnv: [
		'<rootDir>/e2e-tests/config/setup-test-framework.js',
		'@wordpress/jest-console',
		'@wordpress/jest-puppeteer-axe',
		'expect-puppeteer',
	],
	testMatch: [ '<rootDir>/e2e-tests/specs/**/*.test.js' ],
	testPathIgnorePatterns: [ '<rootDir>/e2e-tests/specs/performance/' ],
	preset: 'jest-puppeteer',
	moduleNameMapper: {},
	transform: { '\\.js$': [ 'babel-jest', { rootMode: 'upward' } ] },
};
