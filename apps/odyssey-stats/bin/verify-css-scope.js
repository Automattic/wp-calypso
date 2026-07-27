/**
 * Post-build check for the `postcss-prefix-selector` scoping in webpack.config.js (see
 * AGENTS.md > CSS Scoping and webpack-css-scope.js). Automates the manual check AGENTS.md
 * documents: build, then grep the compiled CSS for the affected class to confirm it's scoped
 * (or intentionally left unscoped), not silently dead.
 *
 * Three things are verified against the real `dist/*.css` output, not the hand-written CSS
 * strings postcss-prefix-selector's options are unit-tested against in css-scope.test.js:
 *
 * 1. The prefix is actually reaching the compiled output at all (catches the whole scoping step
 *    silently no-op'ing, e.g. a broken loader wiring).
 * 2. Every root in `prefix` is classified in `entryPointRoots` or `portalRoots`. Without this,
 *    adding a new root to `prefix` without also classifying it here would silently fall through
 *    check 3 below rather than failing loudly — the check would just never know the new root
 *    exists, which defeats the point of automating this at all.
 * 3. No compiled rule self-nests one of `entryPointRoots` (`.jp-stats-dashboard`,
 *    `.jp-stats-widget`) under `prefix` — i.e. `:where(<roots>) X` where X's compound selector
 *    contains one of those two. That shape can never match anything, since Jetpack's PHP places
 *    both directly on the page: they're never nested inside each other or inside a portal root,
 *    so they can never satisfy the ancestor requirement the prefix just added. This is exactly
 *    how apps/odyssey-stats#STATS-368 broke, and how `.jp-stats-dashboard` itself was *also*
 *    broken until this same change added its missing `exclude` entry: a mount point's own root
 *    styling loses its `exclude` entry and gets nested under the very prefix it's a root of.
 *
 * Check 3 only covers `entryPointRoots`, not every selector in `prefix`: the portal roots
 * (`.color-scheme`, `.ReactModalPortal`, etc.) are routinely — and correctly — nested *inside*
 * `.jp-stats-dashboard`/`.jp-stats-widget` for per-section theming (see
 * `.color-scheme.is-light .masterbar` in css-scope.test.js), so a rule scoping through one of
 * them is normally still live. Whether that's true can't be derived from the compiled CSS alone
 * — it depends on the real DOM hierarchy between mount points, which only `entryPointRoots`/
 * `portalRoots` (hand-maintained, right next to `prefix` in webpack-css-scope.js) encode. Check 2
 * is what makes that hand-maintenance actually load-bearing instead of just hopeful: a new root
 * added to `prefix` and left unclassified fails the build immediately, naming the root and
 * telling the developer which two lists to add it to.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const postcss = require( 'postcss' );
const selectorParser = require( 'postcss-selector-parser' );
const { prefix, entryPointRoots, portalRoots } = require( '../webpack-css-scope' );

const distDir = path.join( __dirname, '..', 'dist' );

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

// Minification strips the whitespace after commas inside `:where(...)`, so comparing against the
// `prefix` string as written in webpack-css-scope.js requires normalizing both sides first.
function normalizeWhereGroupSpacing( selector ) {
	return selector.replace( /,\s+/g, ',' );
}

/**
 * The individual root selectors inside a `:where(...)` prefix string, as their string forms (e.g.
 * `.jp-stats-dashboard`, `[data-base-ui-portal]`).
 */
function getPrefixRoots( prefixToParse ) {
	const roots = [];
	selectorParser( ( selectors ) => {
		selectors.walkPseudos( ( pseudo ) => {
			if ( pseudo.value === ':where' ) {
				pseudo.each( ( selector ) => roots.push( selector.toString().trim() ) );
			}
		} );
	} ).processSync( prefixToParse );
	return roots;
}

/**
 * Given a rule selector that starts with the `:where(<roots>)` prefix, returns the individual
 * simple selectors (e.g. `['.jp-stats-widget', '.is-ready']`) making up the compound selector
 * immediately following it — i.e. whatever the prefix is scoping this rule's content to.
 *
 * Only walks the selector's top-level node sequence (not a recursive `.walk()`), so it doesn't
 * descend into `:where(...)`'s own argument list — those are the roots themselves, not "after".
 */
function getCompoundAfterPrefix( selector ) {
	const compoundNodes = [];
	let sawWhere = false;
	let sawFirstCombinator = false;

	selectorParser( ( selectors ) => {
		for ( const node of selectors.first.nodes ) {
			if ( ! sawWhere ) {
				sawWhere = node.type === 'pseudo' && node.value === ':where';
				continue;
			}
			if ( node.type === 'combinator' ) {
				if ( ! sawFirstCombinator ) {
					sawFirstCombinator = true;
					continue;
				}
				break;
			}
			compoundNodes.push( node.toString() );
		}
	} ).processSync( selector );

	return compoundNodes;
}

/**
 * Pure check: given compiled CSS text, returns a list of human-readable failure messages (empty
 * when everything is scoped correctly). Split out from `run()` so it's unit-testable against
 * hand-written CSS without needing a real `dist/` build on disk.
 *
 * `prefixToCheck`/`entryPointRootsToCheck`/`portalRootsToCheck` default to the real values from
 * webpack-css-scope.js; tests pass different ones to prove the check follows whatever those are
 * configured to, rather than a list of "known" mount points hard-coded into this file.
 */
function findScopeFailures(
	css,
	prefixToCheck = prefix,
	entryPointRootsToCheck = entryPointRoots,
	portalRootsToCheck = portalRoots
) {
	const rules = collectRules( css );
	const normalizedPrefix = normalizeWhereGroupSpacing( prefixToCheck );
	const prefixedRules = rules.filter( ( rule ) =>
		rule.selectors.some( ( selector ) =>
			normalizeWhereGroupSpacing( selector ).startsWith( normalizedPrefix )
		)
	);
	const failures = [];

	if ( ! prefixedRules.some( ( rule ) => rule.nodes.length > 0 ) ) {
		failures.push(
			'No compiled rule was prefixed with the postcss-prefix-selector scope at all — the ' +
				'scoping step may not be running. Check webpack.config.js and webpack-css-scope.js.'
		);
		return failures;
	}

	const roots = getPrefixRoots( prefixToCheck );
	const classifiedRoots = new Set( [ ...entryPointRootsToCheck, ...portalRootsToCheck ] );
	const unclassifiedRoots = roots.filter( ( root ) => ! classifiedRoots.has( root ) );

	if ( unclassifiedRoots.length > 0 ) {
		failures.push(
			`${ unclassifiedRoots.join( ', ' ) } ${
				unclassifiedRoots.length > 1 ? 'are' : 'is'
			} in \`prefix\` but not classified in \`entryPointRoots\` or \`portalRoots\` in ` +
				'webpack-css-scope.js. Add it to `entryPointRoots` if it is a standalone mount point ' +
				'never nested inside another root, or to `portalRoots` if it can legitimately nest ' +
				"inside one — otherwise this check can't tell whether self-nesting it would be dead."
		);
		return failures;
	}

	for ( const rule of prefixedRules ) {
		if ( rule.nodes.length === 0 ) {
			continue;
		}

		for ( const selector of rule.selectors ) {
			if ( ! normalizeWhereGroupSpacing( selector ).startsWith( normalizedPrefix ) ) {
				continue;
			}

			const compoundNodes = getCompoundAfterPrefix( selector );
			const selfNestedRoot = entryPointRootsToCheck.find( ( root ) =>
				compoundNodes.includes( root )
			);

			if ( selfNestedRoot ) {
				failures.push(
					`Dead rule found: \`${ selector.trim() }\` nests ${ selfNestedRoot } under a ` +
						'`:where(...)` group it is itself a member of, so it can never match anything ' +
						`(Jetpack's PHP places ${ selfNestedRoot } directly on the page — it never has a ` +
						'matching ancestor). Add an `exclude` entry for it in webpack-css-scope.js — this ' +
						'is the STATS-368 failure mode.'
				);
			}
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
