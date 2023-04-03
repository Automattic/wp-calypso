const jestPreset = require( '../../test/packages/jest-preset.js' );

module.exports = {
	...jestPreset,
	testPathIgnorePatterns: [
		...( jestPreset.testPathIgnorePatterns || [] ), // Spread existing ignore patterns (if any)
		// Ignore test utils files
		'[a-zA-Z/]*test/utils.ts[x]?',
	],
};
