module.exports = {
	modulePaths: [
		'<rootDir>/test/',
		'<rootDir>/server/',
		'<rootDir>/client/',
		'<rootDir>/client/extensions/',
	],
	rootDir: './../../',
	testEnvironment: 'node',
	testMatch: [
		'**/bin/**/__integration__/*.js',
		'**/client/**/__integration__/*.js',
		'**/server/**/__integration__/*.js',
	],
	verbose: true,
};
