/**
 * Post-build check for the `postcss-prefix-selector` scoping in webpack.config.js (see
 * AGENTS.md > CSS Scoping and webpack-css-scope.js). Automates the manual check AGENTS.md
 * documents: build, then grep the compiled CSS to confirm a selector is scoped (or intentionally
 * left unscoped), not silently dead — checked here against the real `dist/*.css` output, not the
 * hand-written strings css-scope.test.js runs the plugin against.
 *
 * Three checks:
 * 1. The prefix reaches the compiled output at all (catches the scoping step silently no-op'ing).
 * 2. Every root in `prefix` is classified in `entryPointRoots` or `portalRoots` — otherwise a new
 *    root added to `prefix` without also classifying it would silently skip check 3 below.
 * 3. No compiled rule self-nests an `entryPointRoots` selector under `prefix` — i.e.
 *    `:where(<roots>) X` where X's compound contains one of them. That's always dead: those roots
 *    are placed directly on the page and never nested inside another root, so they can never
 *    satisfy the ancestor requirement the prefix just added. This is the STATS-368 failure mode.
 *
 * Check 3 only covers `entryPointRoots`, not every `prefix` selector: portal roots (`.color-scheme`
 * etc.) are routinely, correctly nested *inside* `.jp-stats-dashboard`/`.jp-stats-widget`, so
 * flagging them the same way would false-positive. Which list a root belongs in can't be derived
 * from the compiled CSS — it depends on the real DOM hierarchy between mount points, which only
 * `entryPointRoots`/`portalRoots` (webpack-css-scope.js) encode.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const postcss = require( 'postcss' );
const selectorParser = require( 'postcss-selector-parser' );
const {
	prefix,
	entryPointRoots,
	portalRoots,
	vendorPrefix,
	vendorEntryPointRoots,
	vendorPortalRoots,
} = require( '../webpack-css-scope' );

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

// Minification strips whitespace after commas inside `:where(...)`, so comparing against `prefix`
// as written in webpack-css-scope.js requires normalizing both sides first.
function normalizeWhereGroupSpacing( selector ) {
	return selector.replace( /,\s+/g, ',' );
}

// The individual root selectors inside a `:where(...)` prefix string.
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
 * Given a rule selector starting with the `:where(<roots>)` prefix, returns the simple selectors
 * making up the compound immediately following it (e.g. `['.jp-stats-widget', '.is-ready']`) — top
 * level only, so it doesn't descend into `:where(...)`'s own argument list.
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
 * Given compiled CSS text, returns human-readable failure messages (empty when everything's fine).
 * Split from `run()` so it's unit-testable against hand-written CSS without a real `dist/` build.
 *
 * `prefixToCheck`/`entryPointRootsToCheck`/`portalRootsToCheck` default to the real values from
 * webpack-css-scope.js; tests override them to prove the check follows whatever those are
 * configured to, not a hard-coded list.
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
	const css = readCompiledCss();
	const failures = [
		...findScopeFailures( css ),
		...findScopeFailures( css, vendorPrefix, vendorEntryPointRoots, vendorPortalRoots ),
	];

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
