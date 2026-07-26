/**
 * Post-build check for the `postcss-prefix-selector` scoping in webpack.config.js (see
 * AGENTS.md > CSS Scoping and webpack-css-scope.js). Automates the manual check AGENTS.md
 * documents: build, then grep the compiled CSS for the affected class to confirm it's scoped
 * (or intentionally left unscoped), not silently dead.
 *
 * Two things are verified against the real `dist/*.css` output, not the hand-written CSS
 * strings postcss-prefix-selector's options are unit-tested against in css-scope.test.js:
 *
 * 1. The prefix is actually reaching the compiled output at all (catches the whole scoping step
 *    silently no-op'ing, e.g. a broken loader wiring).
 * 2. Each mount point that styles its own root element (`.jp-stats-widget`, `.color-scheme.is-*`,
 *    `.stats-widget-content.color-scheme`) still has a real, non-empty, *unprefixed* rule in the
 *    compiled output.
 *
 * Check 2's expected selectors are intentionally hand-maintained here rather than imported from
 * webpack-css-scope.js's `exclude` list: this is exactly how apps/odyssey-stats#STATS-368 broke
 * (wp-calypso#112498 dropped a mount point from the scoping config without anyone noticing, since
 * a missing exclude entry produces no build error or JS exception, just dead CSS). Importing the
 * list under test would make this check blind to the same class of regression happening again.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const postcss = require( 'postcss' );
const { prefix } = require( '../webpack-css-scope' );

const distDir = path.join( __dirname, '..', 'dist' );

const SELF_SCOPED_TARGETS = [
	{
		description: '.jp-stats-widget (the WP-Admin dashboard widget styling its own mount point)',
		pattern: /^\.jp-stats-widget(?![\w-])/,
	},
	{
		description:
			'.color-scheme.is-<scheme> (colour scheme vars set on the element that carries the class)',
		pattern: /^\.color-scheme\.is-[\w-]+$/,
	},
	{
		description:
			'.stats-widget-content.color-scheme (the widget’s primary→accent remap on its own root)',
		pattern: /^\.stats-widget-content\.color-scheme$/,
	},
];

function readCompiledCss() {
	if ( ! fs.existsSync( distDir ) ) {
		throw new Error( `${ distDir } does not exist — run \`yarn build\` first.` );
	}

	return fs
		.readdirSync( distDir )
		.filter( ( file ) => file.endsWith( '.css' ) )
		.map( ( file ) => fs.readFileSync( path.join( distDir, file ), 'utf8' ) )
		.join( '\n' );
}

function collectRules( css ) {
	const rules = [];
	postcss.parse( css ).walkRules( ( rule ) => {
		rules.push( rule );
	} );
	return rules;
}

function hasNonEmptyMatch( rules, matches ) {
	return rules.some(
		( rule ) => rule.nodes.length > 0 && rule.selectors.some( ( selector ) => matches( selector ) )
	);
}

// Minification strips the whitespace after commas inside `:where(...)`, so comparing against the
// `prefix` string as written in webpack-css-scope.js requires normalizing both sides first.
function normalizeWhereGroupSpacing( selector ) {
	return selector.replace( /,\s+/g, ',' );
}

/**
 * Pure check: given compiled CSS text, returns a list of human-readable failure messages (empty
 * when everything is scoped correctly). Split out from `run()` so it's unit-testable against
 * hand-written CSS without needing a real `dist/` build on disk.
 */
function findScopeFailures( css ) {
	const rules = collectRules( css );
	const failures = [];
	const normalizedPrefix = normalizeWhereGroupSpacing( prefix );

	if (
		! hasNonEmptyMatch( rules, ( selector ) =>
			normalizeWhereGroupSpacing( selector ).startsWith( normalizedPrefix )
		)
	) {
		failures.push(
			'No compiled rule was prefixed with the postcss-prefix-selector scope at all — the ' +
				'scoping step may not be running. Check webpack.config.js and webpack-css-scope.js.'
		);
	}

	for ( const target of SELF_SCOPED_TARGETS ) {
		if ( ! hasNonEmptyMatch( rules, ( selector ) => target.pattern.test( selector ) ) ) {
			failures.push(
				`No non-empty, unprefixed rule found for ${ target.description }. Either the source ` +
					'CSS for this mount point was removed (drop the matching entry from ' +
					'webpack-css-scope.js’s `exclude` list too), or it lost its exclude entry and is ' +
					'now nested under itself — which is the STATS-368 failure mode: the rule compiles ' +
					'but can never match anything at runtime.'
			);
		}
	}

	return failures;
}

function run() {
	const failures = findScopeFailures( readCompiledCss() );

	if ( failures.length > 0 ) {
		// eslint-disable-next-line no-console
		console.error( 'CSS scope verification failed:\n' );
		failures.forEach( ( failure ) => console.error( `  ✗ ${ failure }` ) ); // eslint-disable-line no-console
		process.exitCode = 1;
		return;
	}

	// eslint-disable-next-line no-console
	console.log( 'CSS scope verification passed.' );
}

if ( require.main === module ) {
	run();
}

module.exports = { findScopeFailures };
