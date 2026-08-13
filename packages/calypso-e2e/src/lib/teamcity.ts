import { readFileSync } from 'node:fs';

/**
 * Access to the TeamCity build this process belongs to.
 *
 * The per-build credentials never leave this module. TeamCity masks the raw
 * token value in the build log, but nothing *derived* from it is masked, so a
 * Basic auth header built from it would print in clear. Callers get an outcome
 * (a status code, a boolean), never a credential, and this module never logs.
 */

interface BuildContext {
	serverUrl: string;
	buildId: string;
	user: string;
	password: string;
}

/**
 * How long a tag POST may take. A test's teardown waits for it, twice over when
 * a refusal is retried, so it is chosen against that budget rather than passed
 * in by whoever calls.
 */
const TAG_TIMEOUT_MS = 2_000;

/**
 * How long a comment PUT may take. Shorter than the tag: a test that hit a
 * throttle waits on this before it may do anything about it, and a ban stated
 * too late to be read is worth no more than one never stated at all.
 */
const COMMENT_TIMEOUT_MS = 1_000;

/**
 * Reads a single key out of `java.util.Properties.store()` output.
 *
 * That writer always uses `=` as the separator, escapes `=`, `:`, `\` and
 * non-ASCII in values, and never emits line continuations, so matching one
 * line at a time is enough. The escaping is not optional here: the build user
 * is `TeamCityBuildId=<id>`, which is stored as `TeamCityBuildId\=<id>`.
 */
export function readProperty( contents: string, key: string ): string | null {
	const pattern = new RegExp( `^${ key.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) }=(.*)$`, 'm' );
	const match = pattern.exec( contents );
	return match ? unescapeProperty( match[ 1 ] ) : null;
}

/**
 * Resolves the backslash escapes a properties writer emits in a value. All of
 * them: a credential decoded a character short builds a Basic header TeamCity
 * refuses, and the failure looks exactly like having no permission.
 */
function unescapeProperty( value: string ): string {
	const escapes: Record< string, string > = { n: '\n', r: '\r', t: '\t', f: '\f' };
	return value.replace( /\\(u[0-9a-fA-F]{4}|[\s\S])/g, ( _full, escaped: string ) =>
		escaped.startsWith( 'u' )
			? String.fromCharCode( parseInt( escaped.slice( 1 ), 16 ) )
			: escapes[ escaped ] ?? escaped
	);
}

/**
 * Reads a properties file, returning null when it is absent or unreadable.
 */
function readPropertiesFile( file: string ): string | null {
	try {
		return readFileSync( file, 'utf8' );
	} catch {
		return null;
	}
}

/**
 * The context of the build this process belongs to, read once.
 *
 * Nothing about it changes during a build, and the callers below make hundreds
 * of calls between them — each of which would otherwise block the event loop on
 * two synchronous file reads while the requests it is racing are in flight.
 * Keyed by the file, so a test pointing at another one is not served this.
 */
let contextRead: { file: string | undefined; context: BuildContext | null } | null = null;

/**
 * The build context, read from disk on the first call and kept after that.
 */
function readBuildContext(): BuildContext | null {
	const file = process.env.TEAMCITY_BUILD_PROPERTIES_FILE;
	if ( contextRead !== null && contextRead.file === file ) {
		return contextRead.context;
	}
	const context = loadBuildContext( file );
	// Only a read that answered is kept. A file that could not be read this
	// moment may be readable the next, and remembering the failure would leave
	// the build untagged for the rest of its life.
	if ( context || ! file ) {
		contextRead = { file, context };
	}
	return context;
}

/**
 * Auth lives in the build parameters file; the server URL and build id may live
 * in the configuration file it points at, so fall back to that one per key.
 */
function loadBuildContext( file: string | undefined ): BuildContext | null {
	if ( ! file ) {
		return null;
	}

	const build = readPropertiesFile( file );
	if ( ! build ) {
		// Named but unreadable is the one transient case, and the caller has to
		// tell it from a local run: this build may be taggable a moment later.
		throw new Error( 'The TeamCity build properties file could not be read.' );
	}

	const configFile = readProperty( build, 'teamcity.configuration.properties.file' );
	const config = configFile ? readPropertiesFile( configFile ) : null;
	const lookup = ( key: string ) =>
		readProperty( build, key ) ?? ( config ? readProperty( config, key ) : null );

	const serverUrl = lookup( 'teamcity.serverUrl' );
	const buildId = lookup( 'teamcity.build.id' );
	const user = lookup( 'teamcity.auth.userId' );
	const password = lookup( 'teamcity.auth.password' );

	if ( ! serverUrl || ! buildId || ! user || ! password ) {
		// A build whose properties name no credentials is an agent configured
		// differently from the rest, not a laptop. Answering "no build here" would
		// let every lookup it makes read as a quiet day for the whole project.
		throw new Error( 'The TeamCity build properties file carries no credentials.' );
	}
	return { serverUrl, buildId, user, password };
}

/**
 * Builds the Basic auth header. Kept private: the encoded form is derived from
 * the token, and TeamCity masks only the raw value in build logs.
 */
function authorization( context: BuildContext ): string {
	return `Basic ${ Buffer.from( `${ context.user }:${ context.password }` ).toString( 'base64' ) }`;
}

/**
 * Tags the build this process belongs to. Returns the HTTP status, or null when
 * there is no TeamCity build around it — a local run, where there is nothing to
 * tag and nothing went wrong.
 *
 * A request that fails throws a bare error instead: the caller has to tell "no
 * build to tag" from "this build is not tagged" to know whether to try again.
 * The original error never leaves this module — it can carry request context,
 * and a caller must never be tempted to print it.
 */
export async function tagOwnBuild( tag: string ): Promise< number | null > {
	const context = readBuildContext();
	if ( ! context ) {
		return null;
	}

	try {
		const response = await fetch(
			`${ context.serverUrl }/app/rest/builds/id:${ context.buildId }/tags`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
					Authorization: authorization( context ),
				},
				body: tag,
				// Bounded: a test waits for this during teardown, and a request
				// that never settles would time the test out.
				signal: AbortSignal.timeout( TAG_TIMEOUT_MS ),
			}
		);
		return response.status;
	} catch {
		throw new Error( 'The TeamCity tag request failed.' );
	}
}

/**
 * Sets the comment on the build this process belongs to, replacing whatever it
 * held. Returns the HTTP status, or null when there is no TeamCity build around
 * this process — a local run, where there is nothing to write on.
 *
 * A comment is a field on the build rather than a line in its log, so it is
 * readable the moment this returns: it comes back from the same build lookup a
 * peer already makes, while a log line waits on the server ingesting a stream.
 * That is the whole reason a ban is stated here.
 *
 * Bounded tightly. A caller has a throttled test waiting on it, and a ban it
 * cannot state in that time is one it must not act as though it has stated.
 */
export async function setOwnBuildComment( text: string ): Promise< number | null > {
	const context = readBuildContext();
	if ( ! context ) {
		return null;
	}

	try {
		const response = await fetch(
			`${ context.serverUrl }/app/rest/builds/id:${ context.buildId }/comment`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'text/plain',
					Authorization: authorization( context ),
				},
				body: text,
				signal: AbortSignal.timeout( COMMENT_TIMEOUT_MS ),
			}
		);
		return response.status;
	} catch {
		// As with the tag: the original error can carry a header derived from the
		// build token, so it never leaves this module.
		throw new Error( 'The TeamCity build comment request failed.' );
	}
}

/**
 * Renders a timestamp the way a build locator's `sinceDate` expects it.
 */
function locatorDate( ms: number ): string {
	return `${ new Date( ms )
		.toISOString()
		.replace( /[-:]/g, '' )
		.replace( /\.\d{3}Z$/, '' ) }+0000`;
}

/**
 * Reads the same format back, e.g. `20260810T124500+0000`. `Date.parse` does not
 * take it. Returns null for anything else, including a date TeamCity omitted.
 */
export function parseBuildDate( value = '' ): number | null {
	const ms = Date.parse(
		value.replace(
			/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})([+-]\d{2})(\d{2})$/,
			'$1-$2-$3T$4:$5:$6$7:$8'
		)
	);
	return Number.isFinite( ms ) ? ms : null;
}

export interface TaggedBuild {
	id: number;
	/** When the build finished, or null while it is still running. */
	finishedAtMs: number | null;
	/** What the build states about itself, empty when it states nothing. */
	comment: string;
}

/**
 * The recent builds in the project carrying a tag, newest first.
 *
 * `personal`, `branch` and `state` must all be given: TeamCity's default filter
 * would otherwise drop personal builds, non-default branches and running builds
 * — which between them are most of the builds we need to hear from, the running
 * ones especially. Returns null when there is nothing to ask.
 *
 * A refused or failed lookup throws the status rather than reading as "no
 * throttle": the per-build credential may not be allowed to query other builds
 * at all, and that has to be visible rather than looking like a quiet run.
 */
export async function fetchBuildsByTag(
	tag: string,
	{ sinceMs }: { sinceMs: number }
): Promise< TaggedBuild[] | null > {
	const context = readBuildContext();
	if ( ! context ) {
		return null;
	}

	const locator =
		`affectedProject:(id:calypso),tag:${ tag },sinceDate:${ locatorDate( sinceMs ) },` +
		'personal:any,branch:default:any,state:any,count:20';

	let response;
	try {
		response = await fetch(
			`${ context.serverUrl }/app/rest/builds?locator=${ encodeURIComponent(
				locator
			) }&fields=build(id,finishDate,comment(text))`,
			{
				headers: { Accept: 'application/json', Authorization: authorization( context ) },
				signal: AbortSignal.timeout( 5_000 ),
			}
		);
	} catch {
		throw new Error( 'The TeamCity build lookup failed.' );
	}
	if ( ! response.ok ) {
		throw new Error( `The TeamCity build lookup answered with status ${ response.status }.` );
	}

	let body: { build?: { id?: number; finishDate?: string; comment?: { text?: string } }[] };
	try {
		body = await response.json();
	} catch {
		// A 200 that is not JSON is a page, not an answer — an auth redirect or a
		// maintenance notice. The parse error itself never leaves this module.
		throw new Error( 'The TeamCity build lookup answered with something that is not JSON.' );
	}

	return ( body.build ?? [] )
		.filter( ( build ): build is { id: number; finishDate?: string; comment?: { text?: string } } =>
			Number.isFinite( build.id )
		)
		.map( ( build ) => ( {
			id: build.id,
			finishedAtMs: parseBuildDate( build.finishDate ),
			// TeamCity leaves the key out rather than sending an empty one.
			comment: build.comment?.text ?? '',
		} ) );
}
