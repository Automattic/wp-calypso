module.exports = {
	preset: '@automattic/calypso-build',
	rootDir: __dirname,
	transformIgnorePatterns: [ 'node_modules[\\/\\\\](?!gridicons)' ],
};
