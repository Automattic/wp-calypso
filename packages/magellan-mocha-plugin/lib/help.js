module.exports = {
	mocha_args: {
		example: "'-R reporter'",
		description: 'Append runtime command line arguments onto mocha',
	},
	tags: {
		example: 'tag1,tag2',
		description: 'Run all tests that match a list of comma-delimited tags (eg: tag1,tag2)',
	},
	suiteTag: {
		example: 'tag1;tag2',
		description:
			'Run all test suites (not ind. tests) that match a list of semi-colon delimited tags',
	},
	group: {
		example: 'prefix/path',
		description: 'Run all tests that match a path prefix like ./tests/smoke',
	},
	test: {
		example: 'path/to/test.js',
		description: 'Run one test with a path like ./tests/smoke/test2.js',
	},
};
