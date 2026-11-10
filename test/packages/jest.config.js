module.exports = {
	rootDir: './../../',
	// run tests for all packages that have a Jest config file
	projects: [ '<rootDir>/packages/*/jest.config.js' ],
	moduleNameMapper: {
		'^react-markdown$': '<rootDir>/test/mocks/react-markdown.js',
	},
};
