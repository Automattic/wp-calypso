module.exports = {
	rootDir: './../../',
	// run tests for all packages that have a Jest config file
	projects: [ '<rootDir>/packages/*/jest.config.js' ],
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!react-markdown|.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css)$)',
	],
};
