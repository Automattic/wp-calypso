module.exports = {
	moduleNameMapper: {
		'^@automattic/calypso-config$': '<rootDir>/client/server/config/index.js',
		// Strip Vite-style asset query suffixes so Jest can resolve `foo.svg?no-inline`.
		'^(.+\\.(?:gif|jpg|jpeg|png|svg|webp|scss|mp4|sass|css))\\?[^?]*$': '$1',
	},
	modulePaths: [ '<rootDir>/client/extensions' ],
	rootDir: '../..',
	testEnvironment: 'node',
	resolver: require.resolve( '@automattic/calypso-jest/src/module-resolver.js' ),
	testMatch: [
		'<rootDir>/bin/**/integration/*.[jt]s',
		'<rootDir>/client/**/integration/*.[jt]s',
		'<rootDir>/test/test/helpers/**/integration/*.[jt]s',
		'!**/.eslintrc.*',
	],
	verbose: false,
};
