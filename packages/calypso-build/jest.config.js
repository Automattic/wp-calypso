module.exports = {
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.js?(x)', '!**/.eslintrc.*' ],
	transform: { '^.+\\.jsx?$': 'babel-jest' },
	verbose: false,
};
