/**
 * Post-build check for the `postcss-prefix-selector` scoping in webpack.config.js (see
 * AGENTS.md > CSS Scoping and webpack-css-scope.js). Automates the manual check AGENTS.md
 * documents: build, then grep the compiled CSS to confirm a selector is scoped (or intentionally
 * left unscoped), not silently dead — checked here against the real `dist/*.css` output, not the
 * hand-written strings css-scope.test.js runs the plugin against.
 *
 * Four checks:
 * 1. The prefix reaches the compiled output at all (catches the scoping step silently no-op'ing).
 * 2. Every root in `prefix` is classified in `entryPointRoots` or `portalRoots` — otherwise a new
 *    root added to `prefix` without also classifying it would silently skip check 3 below.
 * 3. No compiled rule self-nests an `entryPointRoots` selector under `prefix` — i.e.
 *    `:where(<roots>) X` where X's compound contains one of them. That's always dead: those roots
 *    are placed directly on the page and never nested inside another root, so they can never
 *    satisfy the ancestor requirement the prefix just added. This is the STATS-368 failure mode.
 * 4. No compiled rule prefixes a selector anchored on the document root — `html`, `body` or
 *    `:root`. The prefix makes everything a descendant of a mount point, and those three never
 *    are, so the rule is dead. `exclude` exists to keep them unprefixed; this catches the case
 *    where a pattern there fails to match the selector as Sass actually emitted it.
 *
 * Check 4 is deliberately structural rather than re-running `exclude` against the compiled
 * selector. Re-running it could never fail: the plugin already tested those same patterns against
 * that same string, so a pattern that missed at build time misses here too. Asking "is this
 * selector anchored somewhere the prefix can never reach" is independent of how `exclude` is
 * written, which is the whole point — it catches gaps in `exclude` rather than trusting it.
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

// Selectors that can never be a descendant of anything, so prefixing them always kills the rule.
const DOCUMENT_ROOT_TAGS = [ 'html', 'body' ];

/**
 * Given a rule selector starting with the `:where(<roots>)` prefix, returns any document-root
 * anchors (`html`, `body`, `:root`) appearing after it. Top level only — a `body` inside an
 * `:is()`/`:where()` argument list is a different question and not necessarily dead.
 */
function getDocumentRootAnchorsAfterPrefix( selector ) {
	const anchors = [];
	let sawWhere = false;

	selectorParser( ( selectors ) => {
		for ( const node of selectors.first.nodes ) {
			if ( ! sawWhere ) {
				sawWhere = node.type === 'pseudo' && node.value === ':where';
				continue;
			}
			const isRootTag = node.type === 'tag' && DOCUMENT_ROOT_TAGS.includes( node.value );
			const isRootPseudo = node.type === 'pseudo' && node.value === ':root';

			if ( isRootTag || isRootPseudo || isAllRootMatchesPseudo( node ) ) {
				anchors.push( node.toString() );
			}
		}
	} ).processSync( selector );

	return anchors;
}

/**
 * True for a matches-any pseudo whose every branch is a document-root anchor, e.g.
 * `:is(html,body)`. Such a group is dead under the prefix for the same reason a bare `body` is.
 *
 * Deliberately requires *every* branch. In a mixed group like `:is(.foo,body) .bar`, only the
 * `body` branch dies — `.foo .bar` still matches, and it is a generic selector that must stay
 * scoped. Flagging the rule would invite excluding it from prefixing, which would leak `.foo .bar`
 * into wp-admin. A dead branch is a smaller problem than an unscoped one.
 */
function isAllRootMatchesPseudo( node ) {
	if ( node.type !== 'pseudo' || ! [ ':is', ':where', ':matches' ].includes( node.value ) ) {
		return false;
	}
	if ( node.nodes.length === 0 ) {
		return false;
	}

	return node.nodes.every( ( branch ) => {
		const branchNodes = branch.nodes.filter( ( child ) => child.type !== 'combinator' );
		return (
			branchNodes.length === 1 &&
			( ( branchNodes[ 0 ].type === 'tag' &&
				DOCUMENT_ROOT_TAGS.includes( branchNodes[ 0 ].value ) ) ||
				( branchNodes[ 0 ].type === 'pseudo' && branchNodes[ 0 ].value === ':root' ) )
		);
	} );
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

			const rootAnchors = getDocumentRootAnchorsAfterPrefix( selector );

			if ( rootAnchors.length > 0 ) {
				failures.push(
					`Dead rule found: \`${ selector.trim() }\` was prefixed despite being anchored on ` +
						`${ rootAnchors.join( ', ' ) }, which the prefix requires to be a descendant of a ` +
						'mount point. Nothing is a descendant of the document root, so the rule can never ' +
						'match. `exclude` in webpack-css-scope.js is meant to keep it unprefixed — check ' +
						'that its pattern matches the selector as Sass emits it, including without spaces ' +
						'around combinators (`body>.x`, not just `body > .x`).'
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
