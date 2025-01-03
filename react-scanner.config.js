module.exports = {
	// Crawl the entire repo
	crawlFrom: './',
	// Needed for properly reporting components with dot notation
	includeSubComponents: true,
	// Exclude usage in tests and stories.
	globs: [ '**/!(test|stories)/!(*stories).@(js|jsx|tsx)' ],
	// Exclude any vendor or docs directories
	exclude: [
		'bin',
		'build',
		'build-tools',
		'config',
		'docs',
		'node_modules',
		'public',
		'results',
		'static',
		'test',
		'vendor',
	],
	// Consider only imports of `@wordpress/components`
	importedFrom: '@wordpress/components',
	// Full usage report
	processors: [ [ 'raw-report', { outputTo: './results/calypso.json' } ] ],
};
