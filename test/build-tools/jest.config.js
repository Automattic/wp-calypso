module.exports = {
	cacheDirectory: '<rootDir>/../.cache/jest',
	rootDir: '../../build-tools',
	testEnvironment: 'node',
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!redux-form|draft-js|calypso)(?!.*\\.(?:gif|jpg|jpeg|png|svg|scss|sass|css))',
	],
	moduleNameMapper: {
		'^calypso/config$': 'calypso/server/config',
		'^calypso/config/(.*)$': 'calypso/server/config/$1',
	},
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	timers: 'fake',
	verbose: false,
};
