module.exports = {
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/server/',
		'<rootDir>/client/',
		'<rootDir>/client/extensions/',
	],
	rootDir: './../../',
	testEnvironment: 'node',
	testMatch: [ '**/__integration__/*.js' ],
	verbose: true,
};
