module.exports = {
	modulePaths: [
		'<rootDir>/../test/',
		'<rootDir>/../server/',
		'<rootDir>/../client/',
	],
	testEnvironment: 'node',
	testMatch: [ '**/test/*.js?(x)' ],
	timers: 'fake',
	verbose: true,
};
