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
 * Resolves the backslash escapes a properties writer emits in a value.
 */
function unescapeProperty( value: string ): string {
	return value.replace( /\\(u[0-9a-fA-F]{4}|[\s\S])/g, ( _full, escaped: string ) => {
		if ( escaped.startsWith( 'u' ) ) {
			return String.fromCharCode( parseInt( escaped.slice( 1 ), 16 ) );
		}
		switch ( escaped ) {
			case 'n':
				return '\n';
			case 'r':
				return '\r';
			case 't':
				return '\t';
			case 'f':
				return '\f';
			default:
				return escaped;
		}
	} );
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
 * Auth lives in the build parameters file; the server URL and build id may live
 * in the configuration file it points at, so fall back to that one per key.
 */
function readBuildContext(): BuildContext | null {
	const file = process.env.TEAMCITY_BUILD_PROPERTIES_FILE;
	if ( ! file ) {
		return null;
	}

	const build = readPropertiesFile( file );
	if ( ! build ) {
		return null;
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
		return null;
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
 * there is no TeamCity build around it (a local run) or the request failed.
 *
 * Errors are swallowed rather than rethrown or logged: a fetch error can carry
 * request context, and callers must never be tempted to print it.
 */
export async function tagOwnBuild( tag: string, timeoutMs = 2_000 ): Promise< number | null > {
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
				signal: AbortSignal.timeout( timeoutMs ),
			}
		);
		return response.status;
	} catch {
		return null;
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
 * The ids of recent builds in the project carrying a tag, newest first.
 *
 * `personal`, `branch` and `state` must all be given: TeamCity's default filter
 * would otherwise drop personal builds, non-default branches and running builds
 * — which between them are most of the builds we need to hear from, the running
 * ones especially. Returns null when there is nothing to ask, or when the ask
 * failed; callers treat both as "no throttle".
 */
export async function fetchBuildsByTag(
	tag: string,
	{
		sinceMs,
		project = process.env.E2E_THROTTLE_PROJECT || 'calypso',
		count = 20,
		timeoutMs = 5_000,
	}: { sinceMs: number; project?: string; count?: number; timeoutMs?: number }
): Promise< number[] | null > {
	const context = readBuildContext();
	if ( ! context ) {
		return null;
	}

	const locator =
		`affectedProject:(id:${ project }),tag:${ tag },sinceDate:${ locatorDate( sinceMs ) },` +
		`personal:any,branch:default:any,state:any,count:${ count }`;

	try {
		const response = await fetch(
			`${ context.serverUrl }/app/rest/builds?locator=${ encodeURIComponent(
				locator
			) }&fields=build(id)`,
			{
				headers: { Accept: 'application/json', Authorization: authorization( context ) },
				signal: AbortSignal.timeout( timeoutMs ),
			}
		);
		if ( ! response.ok ) {
			return null;
		}
		const body = ( await response.json() ) as { build?: { id?: number }[] };
		return ( body.build ?? [] )
			.map( ( build ) => build.id )
			.filter( ( id ): id is number => typeof id === 'number' );
	} catch {
		return null;
	}
}

/**
 * A build's log as text, or null when it cannot be read.
 *
 * There is no REST endpoint for logs and no way to ask for part of one, so this
 * pulls the whole thing. Only ever called for a build already known to carry a
 * throttle tag, which is normally none of them.
 */
export async function fetchBuildLog(
	buildId: number,
	timeoutMs = 10_000
): Promise< string | null > {
	const context = readBuildContext();
	if ( ! context ) {
		return null;
	}

	try {
		const response = await fetch(
			`${ context.serverUrl }/downloadBuildLog.html?buildId=${ buildId }`,
			{
				headers: { Authorization: authorization( context ) },
				signal: AbortSignal.timeout( timeoutMs ),
			}
		);
		return response.ok ? await response.text() : null;
	} catch {
		return null;
	}
}
