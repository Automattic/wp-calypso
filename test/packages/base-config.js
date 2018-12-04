/** @format */

module.exports = {
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.js?(x)' ],
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
	},
	verbose: false,
};
