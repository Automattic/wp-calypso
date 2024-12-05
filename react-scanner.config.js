module.exports = {
	// Crawl the entire repo
	crawlFrom: './',
	// Needed for properly reporting components with dot notation
	includeSubComponents: true,
	// Exclude usage in tests, stories, and React Native files.
	globs: [ '**/!(test|stories)/!(*stories).@(js|ts)?(x)' ],
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
	],
	/*
	 * Filter out any non-component React elements and consider only imports of
	 * `@wordpress/components` outside of the package.
	 */
	importedFrom: '@wordpress/components',
	processors: [ [ 'raw-report', { outputTo: './results/calypso.json' } ] ],
};
