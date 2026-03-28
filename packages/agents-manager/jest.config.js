// Spread instead of `preset` so the SCSS asset transform is preserved.
// Jest's preset resolution drops `transform` entries, which causes SCSS
// import failures when running `yarn jest packages/agents-manager` directly.
const base = require( '../../test/packages/jest-preset' );

module.exports = {
	...base,
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
};
