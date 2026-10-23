/**
 * A small matcher for Adblock Plus–style network filters, as used by EasyList,
 * uBlock Origin and AdGuard lists. It supports the subset of the syntax needed to
 * decide whether a first-party script or stylesheet request would be blocked:
 * `||` hostname anchors, `|` anchors, `^` separators, `*` wildcards, `/regex/`
 * rules, `@@` exceptions, `$important`, `$badfilter`, resource types, party,
 * `domain=`/`from=`, `to=`, `denyallow=`, `method=` and `match-case`.
 *
 * Cosmetic filters and rules whose only effect is not a block (`$csp`,
 * `$removeparam`, `$redirect-rule`, …) are ignored.
 */

const TYPE_ALIASES = {
	script: 'script',
	stylesheet: 'stylesheet',
	css: 'stylesheet',
	image: 'image',
	font: 'font',
	media: 'media',
	object: 'object',
	'object-subrequest': 'object',
	xmlhttprequest: 'xmlhttprequest',
	xhr: 'xmlhttprequest',
	subdocument: 'subdocument',
	frame: 'subdocument',
	document: 'document',
	doc: 'document',
	ping: 'ping',
	beacon: 'ping',
	websocket: 'websocket',
	webrtc: 'webrtc',
	other: 'other',
	popup: 'popup',
	popunder: 'popup',
	all: 'all',
	inline: 'inline',
	'inline-script': 'inline',
	'inline-font': 'inline',
};

// Options that change what a matching rule does instead of blocking the request,
// or that only apply to cosmetic filtering. Rules carrying them never block.
const NON_BLOCKING_OPTIONS = new Set( [
	'csp',
	'removeparam',
	'queryprune',
	'redirect-rule',
	'header',
	'removeheader',
	'responseheader',
	'permissions',
	'replace',
	'urltransform',
	'uritransform',
	'urlskip',
	'cookie',
	'hls',
	'jsonprune',
	'xmlprune',
	'elemhide',
	'ehide',
	'generichide',
	'ghide',
	'specifichide',
	'shide',
	'genericblock',
	'jsinject',
	'content',
	'urlblock',
	'extension',
	'stealth',
	'network',
	'app',
	'referrerpolicy',
	'ipaddress',
] );

// Options that do not affect whether a request is blocked.
const NEUTRAL_OPTIONS = new Set( [ 'redirect', 'rewrite', 'empty', 'mp4', 'collapse', 'reason' ] );

function parseHostList( value ) {
	return value
		.split( '|' )
		.filter( Boolean )
		.map( ( entry ) =>
			entry.startsWith( '~' )
				? { host: entry.slice( 1 ).toLowerCase(), negated: true }
				: { host: entry.toLowerCase(), negated: false }
		);
}

function hostMatches( host, pattern ) {
	if ( pattern.endsWith( '.*' ) ) {
		const base = pattern.slice( 0, -2 );
		return host === base || host.startsWith( `${ base }.` ) || host.includes( `.${ base }.` );
	}
	return host === pattern || host.endsWith( `.${ pattern }` );
}

/**
 * Evaluate a `domain=`-style list against a host. A list containing only negated
 * entries applies everywhere except the negated hosts.
 */
function hostListApplies( list, host ) {
	if ( ! list ) {
		return true;
	}
	const positives = list.filter( ( entry ) => ! entry.negated );
	if ( list.some( ( entry ) => entry.negated && hostMatches( host, entry.host ) ) ) {
		return false;
	}
	return positives.length === 0 || positives.some( ( entry ) => hostMatches( host, entry.host ) );
}

function escapeRegExp( text ) {
	return text.replace( /[.+?${}()[\]\\]/g, '\\$&' );
}

function patternToRegExp( pattern, matchCase ) {
	let source = pattern;
	let prefix = '';
	let suffix = '';

	if ( source.startsWith( '||' ) ) {
		source = source.slice( 2 );
		prefix = '^[a-z][a-z0-9+.-]*:\\/+(?:[^/?#]*\\.)?';
	} else if ( source.startsWith( '|' ) ) {
		source = source.slice( 1 );
		prefix = '^';
	}
	if ( source.endsWith( '|' ) ) {
		source = source.slice( 0, -1 );
		suffix = '$';
	}

	const body = source
		.split( '*' )
		.map( ( part ) =>
			part
				.split( '^' )
				.map( escapeRegExp )
				.map( ( piece ) => piece.replace( /\|/g, '\\|' ) )
				.join( '(?:[^a-zA-Z0-9_.%-]|$)' )
		)
		.join( '.*' );

	return new RegExp( prefix + body + suffix, matchCase ? '' : 'i' );
}

function splitOptions( text ) {
	const startsOptions = ( dollar ) => /^[\w~-]/.test( text.slice( dollar + 1 ) );
	if ( text.startsWith( '/' ) ) {
		// In a regex rule the options follow the closing slash; a `$` anywhere else,
		// including inside an option value such as `$removeparam=/^utm_/`, is not a
		// separator.
		for ( let dollar = text.indexOf( '$' ); dollar > 0; dollar = text.indexOf( '$', dollar + 1 ) ) {
			if ( text[ dollar - 1 ] === '/' && startsOptions( dollar ) ) {
				return [ text.slice( 0, dollar ), text.slice( dollar + 1 ) ];
			}
		}
		if ( text.endsWith( '/' ) ) {
			return [ text, '' ];
		}
	}
	const dollar = text.lastIndexOf( '$' );
	if ( dollar >= 0 && startsOptions( dollar ) ) {
		return [ text.slice( 0, dollar ), text.slice( dollar + 1 ) ];
	}
	return [ text, '' ];
}

/**
 * Identify a rule independently of option order, so a `$badfilter` rule can be
 * matched to the rule it disables.
 */
function ruleKey( exception, pattern, options ) {
	const kept = options
		.filter( ( option ) => option.toLowerCase() !== 'badfilter' )
		.map( ( option ) => option.toLowerCase() )
		.sort();
	return `${ exception ? '@@' : '' }${ pattern }${ kept.length ? `$${ kept.join( ',' ) }` : '' }`;
}

function isCosmetic( line ) {
	return /#[@?$%]?#|#@?[$%?]#|\$@?\$/.test( line );
}

/**
 * Parse one line of a filter list. Returns `null` for comments, cosmetic filters
 * and network rules that can never block a request.
 * @param {string} line   Raw filter list line.
 * @param {Object} source Optional metadata (list name, line number) kept on the rule.
 */
function parseRule( line, source = {} ) {
	const raw = line.trim();
	if (
		! raw ||
		raw.startsWith( '!' ) ||
		raw.startsWith( '[' ) ||
		( raw.startsWith( '#' ) && ! raw.startsWith( '#/' ) ) ||
		isCosmetic( raw )
	) {
		return null;
	}

	let text = raw;
	const exception = text.startsWith( '@@' );
	if ( exception ) {
		text = text.slice( 2 );
	}

	const [ pattern, optionText ] = splitOptions( text );
	const options = optionText ? optionText.split( ',' ) : [];
	const rule = {
		raw,
		key: ruleKey( exception, pattern, options ),
		exception,
		pattern,
		important: false,
		badfilter: false,
		matchCase: false,
		types: null,
		excludedTypes: null,
		party: null,
		domains: null,
		toDomains: null,
		denyallow: null,
		methods: null,
		...source,
	};

	for ( const option of options ) {
		const [ rawName, ...valueParts ] = option.split( '=' );
		const value = valueParts.join( '=' );
		const negated = rawName.startsWith( '~' );
		const name = ( negated ? rawName.slice( 1 ) : rawName ).toLowerCase();

		if ( NON_BLOCKING_OPTIONS.has( name ) ) {
			return null;
		}
		if ( NEUTRAL_OPTIONS.has( name ) ) {
			continue;
		}
		if ( TYPE_ALIASES[ name ] ) {
			const type = TYPE_ALIASES[ name ];
			if ( negated ) {
				rule.excludedTypes = [ ...( rule.excludedTypes ?? [] ), type ];
			} else {
				rule.types = [ ...( rule.types ?? [] ), type ];
			}
			continue;
		}

		switch ( name ) {
			case 'third-party':
			case '3p':
				rule.party = negated ? 'first' : 'third';
				break;
			case 'first-party':
			case '1p':
				rule.party = negated ? 'third' : 'first';
				break;
			case 'strict1p':
				rule.party = negated ? 'strict-third' : 'strict-first';
				break;
			case 'strict3p':
				rule.party = negated ? 'strict-first' : 'strict-third';
				break;
			case 'domain':
			case 'from':
				rule.domains = parseHostList( value );
				break;
			case 'to':
				rule.toDomains = parseHostList( value );
				break;
			case 'denyallow':
				rule.denyallow = parseHostList( value ).map( ( entry ) => entry.host );
				break;
			case 'method':
				rule.methods = value.toLowerCase().split( '|' );
				break;
			case 'important':
				rule.important = true;
				break;
			case 'badfilter':
				rule.badfilter = true;
				break;
			case 'match-case':
				rule.matchCase = ! negated;
				break;
			default:
				// Unknown options make the rule's effect uncertain; skip rather than guess.
				return null;
		}
	}

	if ( rule.types?.every( ( type ) => type === 'popup' || type === 'inline' ) ) {
		return null;
	}

	try {
		if ( pattern.length > 2 && pattern.startsWith( '/' ) && pattern.endsWith( '/' ) ) {
			rule.regexp = new RegExp( pattern.slice( 1, -1 ), rule.matchCase ? '' : 'i' );
		} else {
			rule.regexp = patternToRegExp( pattern || '*', rule.matchCase );
		}
	} catch {
		return null;
	}

	return rule;
}

function registrableDomain( host ) {
	return host.split( '.' ).slice( -2 ).join( '.' );
}

function appliesToType( rule, type ) {
	if ( rule.types && ! rule.types.includes( type ) && ! rule.types.includes( 'all' ) ) {
		return false;
	}
	return ! rule.excludedTypes?.includes( type );
}

function appliesToParty( rule, requestHost, pageHost ) {
	if ( ! rule.party ) {
		return true;
	}
	if ( rule.party === 'strict-first' || rule.party === 'strict-third' ) {
		return ( requestHost === pageHost ) === ( rule.party === 'strict-first' );
	}
	const isFirstParty = registrableDomain( requestHost ) === registrableDomain( pageHost );
	return isFirstParty === ( rule.party === 'first' );
}

function withHosts( request ) {
	return {
		...request,
		requestHost: new URL( request.url ).hostname,
		pageHost: new URL( request.pageUrl ).hostname,
	};
}

function matchesRequest( rule, request ) {
	const { requestHost, pageHost } = request;

	if ( ! appliesToType( rule, request.type ) ) {
		return false;
	}
	if ( ! appliesToParty( rule, requestHost, pageHost ) ) {
		return false;
	}
	if ( ! hostListApplies( rule.domains, pageHost ) ) {
		return false;
	}
	if ( ! hostListApplies( rule.toDomains, requestHost ) ) {
		return false;
	}
	if ( rule.denyallow?.some( ( host ) => hostMatches( requestHost, host ) ) ) {
		return false;
	}
	if ( rule.methods ) {
		const method = ( request.method ?? 'get' ).toLowerCase();
		const allowed = rule.methods.filter( ( m ) => ! m.startsWith( '~' ) );
		if ( rule.methods.includes( `~${ method }` ) ) {
			return false;
		}
		if ( allowed.length && ! allowed.includes( method ) ) {
			return false;
		}
	}
	return rule.regexp.test( request.url );
}

/**
 * Build a matcher from parsed rules. `match()` returns the blocking rules and,
 * when the block is overridden, the exception that allows the request.
 * @param {Array} rules Parsed rules.
 */
function createMatcher( rules ) {
	const badfiltered = new Set(
		rules.filter( ( rule ) => rule.badfilter ).map( ( rule ) => rule.key )
	);
	const active = rules.filter( ( rule ) => ! rule.badfilter && ! badfiltered.has( rule.key ) );
	const blocking = active.filter( ( rule ) => ! rule.exception );
	const exceptions = active.filter( ( rule ) => rule.exception );

	return {
		size: active.length,
		match( unresolved ) {
			const request = withHosts( unresolved );
			const blockedBy = blocking.filter( ( rule ) => matchesRequest( rule, request ) );
			if ( ! blockedBy.length ) {
				return { blocked: false, blockedBy, allowedBy: [] };
			}
			const documentRequest = {
				...request,
				url: request.pageUrl,
				type: 'document',
				requestHost: request.pageHost,
			};
			// An exception with no type option never covers the page itself.
			const allowedBy = exceptions.filter(
				( rule ) =>
					matchesRequest( rule, request ) ||
					( rule.types &&
						appliesToType( rule, 'document' ) &&
						matchesRequest( rule, documentRequest ) )
			);
			const important = blockedBy.filter( ( rule ) => rule.important );
			const blocked = important.length > 0 || allowedBy.length === 0;
			return { blocked, blockedBy: important.length ? important : blockedBy, allowedBy };
		},
	};
}

// The `!#if` tokens that hold for uBlock Origin on desktop Chromium and Firefox,
// the platforms the audit stands in for. Unknown tokens are false, as in uBlock.
const ENVIRONMENTS = [
	new Set( [ 'ext_ublock', 'env_chromium', 'cap_user_stylesheet' ] ),
	new Set( [
		'ext_ublock',
		'env_firefox',
		'cap_html_filtering',
		'cap_ipaddress',
		'cap_user_stylesheet',
	] ),
];

/**
 * Evaluate a `!#if` expression (`token`, `!`, `&&`, `||`, parentheses).
 */
function evaluateCondition( expression, environment ) {
	const tokens = expression.match( /!|&&|\|\||\(|\)|[\w-]+/g ) ?? [];
	let position = 0;
	// Binary operators, loosest first.
	const operators = [ '||', '&&' ];
	const parse = ( level ) => {
		if ( level === operators.length ) {
			const token = tokens[ position++ ];
			if ( token === '!' ) {
				return ! parse( level );
			}
			if ( token === '(' ) {
				const value = parse( 0 );
				position++;
				return value;
			}
			return environment.has( token );
		}
		let value = parse( level + 1 );
		while ( tokens[ position ] === operators[ level ] ) {
			position++;
			const right = parse( level + 1 );
			value = level === 0 ? value || right : value && right;
		}
		return value;
	};
	return parse( 0 );
}

const INCLUDE = /^!#include\s+(\S+)/;

/**
 * Walk a filter list, tracking `!#if` blocks, and call `onLine` for each line
 * that is active on at least one of the audited platforms. `!#include` lines
 * are reported through `onInclude` instead; when it returns text, that sublist
 * is walked in place with `nested` set.
 */
function walkFilterList( text, { onLine, onInclude } ) {
	// One stack of open `!#if` blocks per environment: whether each block is active.
	const stacks = ENVIRONMENTS.map( () => [] );
	const active = () => stacks.some( ( stack ) => stack.every( Boolean ) );
	const walk = ( source, nested ) => {
		source.split( /\r?\n/ ).forEach( ( line, index ) => {
			const directive = /^!#(if|else|endif)\b\s*(.*)$/.exec( line.trim() );
			if ( directive ) {
				const [ , keyword, expression ] = directive;
				stacks.forEach( ( stack, i ) => {
					if ( keyword === 'if' ) {
						stack.push( evaluateCondition( expression, ENVIRONMENTS[ i ] ) );
					} else if ( keyword === 'else' && stack.length ) {
						stack.push( ! stack.pop() );
					} else if ( keyword === 'endif' ) {
						stack.pop();
					}
				} );
				return;
			}
			if ( ! active() ) {
				return;
			}
			const include = INCLUDE.exec( line.trim() )?.[ 1 ];
			if ( include ) {
				// uBlock Origin only follows includes in the top-level list.
				const sublist = nested ? undefined : onInclude( include );
				if ( sublist !== undefined ) {
					const depth = stacks.map( ( stack ) => stack.length );
					walk( sublist, true );
					// An unbalanced sublist must not leak `!#if` state into its parent.
					stacks.forEach( ( stack, i ) => ( stack.length = depth[ i ] ) );
				}
				return;
			}
			onLine( line, index + 1, nested );
		} );
	};
	walk( text, false );
}

/**
 * Names of the sublists a filter list pulls in with `!#include`, leaving out
 * those inside `!#if` blocks that do not apply to the audited platforms.
 * @param {string} text Filter list contents.
 */
function listIncludes( text ) {
	const names = new Set();
	walkFilterList( text, {
		onLine: () => {},
		onInclude: ( name ) => {
			names.add( name );
		},
	} );
	return [ ...names ];
}

/**
 * Parse a whole filter list. Rules inside `!#if` blocks are kept only when the
 * condition holds on at least one of the audited platforms. `!#include` lines
 * are replaced by the matching entry of `includes`, whose rules are recorded
 * as coming from `<list>/<name>`.
 * @param {string} text     Filter list contents.
 * @param {string} list     Name recorded on each rule.
 * @param {Object} includes Contents of included sublists, keyed by name.
 */
function parseFilterList( text, list, includes = {} ) {
	const rules = [];
	let label = list;
	walkFilterList( text, {
		onInclude: ( name ) => {
			label = `${ list }/${ name }`;
			return includes[ name ];
		},
		onLine: ( line, number, nested ) => {
			const rule = parseRule( line, { list: nested ? label : list, line: number } );
			if ( rule ) {
				rules.push( rule );
			}
		},
	} );
	return rules;
}

function anchoredHost( pattern ) {
	const match = /^(?:\|\||\|[a-z][a-z0-9+.-]*:\/\/)([^/^*|$:?]+)(.?)/i.exec( pattern );
	return match ? { host: match[ 1 ].toLowerCase(), wildcard: match[ 2 ] === '*' } : null;
}

/**
 * Whether a rule could ever affect script or stylesheet requests to `assetHosts`
 * made from pages on `pageHosts`. Used to trim full filter lists down to the
 * rules worth auditing, which drops the vast majority of host-specific rules.
 * @param {Object} rule                 Parsed rule.
 * @param {Object} context
 * @param {string[]} context.pageHosts  Hosts of pages that load the assets.
 * @param {string[]} context.assetHosts Hosts the assets are served from.
 */
function isRelevantRule( rule, { pageHosts, assetHosts } ) {
	if ( rule.badfilter ) {
		return true;
	}
	const types = [ 'script', 'stylesheet', ...( rule.exception ? [ 'document' ] : [] ) ];
	if ( ! types.some( ( type ) => appliesToType( rule, type ) ) ) {
		return false;
	}
	if ( ! pageHosts.some( ( host ) => hostListApplies( rule.domains, host ) ) ) {
		return false;
	}
	const anchored = anchoredHost( rule.pattern );
	if ( ! anchored || anchored.wildcard ) {
		return true;
	}
	const candidates = rule.exception ? [ ...assetHosts, ...pageHosts ] : assetHosts;
	return candidates.some( ( host ) => hostMatches( host, anchored.host ) );
}

module.exports = {
	parseRule,
	parseFilterList,
	listIncludes,
	createMatcher,
	isRelevantRule,
};
