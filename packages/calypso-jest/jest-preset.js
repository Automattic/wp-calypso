const { defaults } = require( 'jest-config' );

module.exports = {
	setupFilesAfterEnv: [ require.resolve( './src/setup.js' ), require.resolve( 'jest-enzyme' ) ],
	snapshotSerializers: [ 'enzyme-to-json/serializer' ],
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/**/test/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	transform: {
		'\\.[jt]sx?$': require.resolve( './src/transform/babel.js' ),
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve( './src/transform/asset.js' ),
	},
	testPathIgnorePatterns: [ ...defaults.testPathIgnorePatterns, '/dist/' ],
	verbose: false,
};
