module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
	transformIgnorePatterns: [
		'node_modules[\\/\\\\](?!((?:.*[\\/\\\\])?(?:lit(?:-element|-html)?|@lit(?:-labs)?)[\\/\\\\]|@a2ui[\\/\\\\]|@fnando[\\/\\\\]|@wordpress[\\/\\\\]theme[\\/\\\\]|(?:.*[\\/\\\\])?(?:uuid|@preact[\\/\\\\]signals-core)[\\/\\\\])|.*\\.(?:gif|jpg|jpeg|png|svg|webp|scss|mp4|sass|css)$)',
	],
};
