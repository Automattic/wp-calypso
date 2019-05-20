module.exports = {
	...require( './node_modules/@wordpress/e2e-tests/jest.config.js' ),
	testPathIgnorePatterns: [ '/asdf/' ],
	transformIgnorePatterns: [ '../../../node_modules/', '/modules/' ],
	haste: {
		providesModuleNodeModules: [ '.*' ],
	},
	rootDir: './node_modules/@wordpress/e2e-tests',
};
