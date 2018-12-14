/** @format */

module.exports = {
	rootDir: './../../packages',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.js?(x)' ],
	transform: { '^.+\\.jsx?$': 'babel-jest' },
	verbose: false,
};
