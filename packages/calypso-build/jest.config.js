module.exports = {
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.js?(x)', '!**/.eslintrc.*' ],
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': __dirname + '/jest/util/assets/transform.js',
	},
	verbose: false,
};
