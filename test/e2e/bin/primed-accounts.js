#!/usr/bin/env node
/**
 * Reports the accounts each TeamCity build type logs in as before its suite, without starting
 * a build. Reads the parameters the Kotlin DSL generates, applies each matrix value, and asks
 * the same resolver the prime-logins setup project uses.
 *
 * Generate the configs first; the DSL needs a JDK the plugin supports:
 *
 *   cd .teamcity && JAVA_HOME=$(/usr/libexec/java_home -v 17) mvn -q teamcity-configs:generate
 *   yarn workspace @automattic/calypso-e2e build
 *
 * Then, from test/e2e:  node bin/primed-accounts.js
 */
const fs = require( 'fs' );
const path = require( 'path' );
const { ATOMIC_VARIATIONS, getAccountNamesToPrime } = require( '@automattic/calypso-e2e' );
const { scripts } = require( '../package.json' );

const configsRoot = path.resolve( __dirname, '../../../.teamcity/target/generated-configs' );

// The variables the resolver reads. Anything else a build type sets cannot change its answer.
const RELEVANT = [
	'AUTHENTICATE_ACCOUNTS',
	'TEST_ON_ATOMIC',
	'GUTENBERG_EDGE',
	'GUTENBERG_NIGHTLY',
	'COBLOCKS_EDGE',
	'JETPACK_TARGET',
	'ATOMIC_VARIATION',
];

/**
 * Whether a build type's accounts come from AUTHENTICATE_ACCOUNTS, which is what the resolver
 * below answers for. Only the projects sharing `prime-logins` do; the rest name their accounts
 * in their own `accountsToPrime`, and `playwright test --project=<name> --list` reports those.
 *
 * A build type can also leave PROJECT to the template default or set it per matrix leg, as
 * `matrix.value.PROJECT.N`; both run a device project, so an absent PROJECT is reported.
 */
function usesAuthenticateAccounts( project ) {
	if ( ! project ) {
		return true;
	}

	const script = scripts[ `test:pw:${ project }` ];
	if ( script === undefined ) {
		// `yarn test:pw:%PROJECT%` is what the build step runs, so this build type cannot
		// start. Worth more than being quietly left out of the table.
		console.warn( `No test:pw:${ project } script: nothing can run PROJECT=${ project }.` );
		return false;
	}

	return /--project=(chrome|mobile)\b/.test( script );
}

/**
 * Lists every generated XML file under a directory.
 */
function findXml( directory ) {
	return fs.readdirSync( directory, { withFileTypes: true } ).flatMap( ( entry ) => {
		const full = path.join( directory, entry.name );

		if ( entry.isDirectory() ) {
			return findXml( full );
		}

		return full.endsWith( '.xml' ) ? [ full ] : [];
	} );
}

/**
 * Returns the `param` entries of an XML file as a map.
 */
function readParams( source ) {
	return new Map(
		[ ...source.matchAll( /<param name="([^"]+)" value="([^"]*)"\s*\/>/g ) ].map( ( m ) => [
			m[ 1 ],
			m[ 2 ],
		] )
	);
}

/**
 * Returns the runs a build type fans out into that can prime differently: one entry per
 * matrix value that carries environment, one per Atomic variation a build step exports
 * around its own Playwright call, or a single unnamed entry otherwise. A matrix over
 * something the resolver never reads, such as the viewport, collapses to one entry.
 */
function readLegs( params, source ) {
	let legs = [];

	for ( const [ key, value ] of params ) {
		const match = key.match( /^matrix\.value\.(.+)\.(\d+)$/ );
		const name = match && match[ 1 ];

		if ( ! name || ! ( name === 'EXTRA_ENV_VARS' || RELEVANT.includes( name.slice( 4 ) ) ) ) {
			continue;
		}

		const label = params.get( `matrix.label.${ name }.${ match[ 2 ] }` ) ?? value;
		legs.push( { label, overrides: { [ name ]: value } } );
	}

	// A mixed build resolves to one variation per run, chosen by the commit no report can know.
	// Show what each run primes instead of picking one, on top of whatever else the build fans
	// out over: leave a leg on `mixed` and the resolver has no variation to answer for.
	if ( params.get( 'env.ATOMIC_VARIATION' ) === 'mixed' ) {
		const base = legs.length ? legs : [ { label: '', overrides: {} } ];
		legs = base.flatMap( ( leg ) =>
			ATOMIC_VARIATIONS.map( ( variation ) => ( {
				label: [ leg.label, `mixed: ${ variation }` ].filter( Boolean ).join( ', ' ),
				overrides: { ...leg.overrides, 'env.ATOMIC_VARIATION': variation },
			} ) )
		);
	}

	// The Jetpack Atomic deployment builds loop the variations inside their steps, so the
	// parameters alone would report only the first of seven runs.
	for ( const [ , value ] of source.matchAll( /export ATOMIC_VARIATION='([^']+)'/g ) ) {
		if ( ! legs.some( ( leg ) => leg.overrides[ 'env.ATOMIC_VARIATION' ] === value ) ) {
			legs.push( { label: value, overrides: { 'env.ATOMIC_VARIATION': value } } );
		}
	}

	return legs.length ? legs : [ null ];
}

/**
 * Applies an EXTRA_ENV_VARS value the way the template's own build step does: KEY=value pairs
 * separated by semicolons, or by commas when the value holds no semicolon. Keep this in step
 * with that script, or the report describes a run that never happens.
 */
function applyExtraEnvVars( env, value ) {
	for ( const pair of ( value ?? '' ).split( value?.includes( ';' ) ? ';' : ',' ) ) {
		const [ name, ...rest ] = pair.split( '=' );
		if ( name && rest.length && RELEVANT.includes( name ) ) {
			env[ name ] = rest.join( '=' );
		}
	}
}

if ( ! fs.existsSync( configsRoot ) ) {
	console.error( `No generated configs under ${ configsRoot }. See the header of this file.` );
	process.exit( 1 );
}

const files = findXml( configsRoot );
const templates = new Map(
	files
		.filter( ( file ) => /Template\.xml$/.test( file ) )
		.map( ( file ) => [
			path.basename( file, '.xml' ),
			readParams( fs.readFileSync( file, 'utf8' ) ),
		] )
);

const rows = [];
for ( const file of files ) {
	if ( templates.has( path.basename( file, '.xml' ) ) ) {
		continue;
	}

	const source = fs.readFileSync( file, 'utf8' );
	const params = readParams( source );
	// One template is referenced inline, several through an inherits block, and a later
	// template's parameter wins over an earlier one's.
	const templateRefs = [
		...source.matchAll( /<settings ref="([^"]+)"|<ref id="([^"]+)"\s*\/>/g ),
	].map( ( m ) => m[ 1 ] ?? m[ 2 ] );
	const inherited = templateRefs.flatMap( ( ref ) => [ ...( templates.get( ref ) ?? [] ) ] );
	const merged = new Map( [ ...inherited, ...params ] );

	// A build type reaches the prime-logins project by running the suite, not by setting the
	// parameter: one that sets nothing primes the default list, and is the one most worth
	// reporting.
	const runsPlaywright =
		/yarn test:pw:/.test( source ) ||
		templateRefs.some( ( ref ) => /E2ETestsBuildTemplate$/.test( ref ) );
	if ( ! runsPlaywright || ! usesAuthenticateAccounts( merged.get( 'PROJECT' ) ) ) {
		continue;
	}

	for ( const leg of readLegs( merged, source ) ) {
		const env = { ...process.env };
		for ( const name of RELEVANT ) {
			delete env[ name ];
			const value = leg?.overrides[ `env.${ name }` ] ?? merged.get( `env.${ name }` );
			if ( value !== undefined ) {
				env[ name ] = value;
			}
		}
		applyExtraEnvVars( env, leg?.overrides.EXTRA_ENV_VARS ?? merged.get( 'EXTRA_ENV_VARS' ) );

		const original = process.env;
		process.env = env;
		let primed;
		try {
			primed = getAccountNamesToPrime();
		} finally {
			process.env = original;
		}

		rows.push( {
			buildType: path.basename( file, '.xml' ).replace( /^RootProjectId_/, '' ),
			leg: leg ? leg.label : '',
			// What this leg ends up with, which is not the build's own parameter when
			// EXTRA_ENV_VARS overrides it.
			configured: env.AUTHENTICATE_ACCOUNTS,
			primed,
		} );
	}

	// A build type that adapts its group to the changed E2E files can end up with no group at
	// all, which the run step turns into "prime the default list" by unsetting the variable.
	if ( merged.get( 'IGNORE_TEST_GROUP_FOR_E2E_CHANGES' ) === 'true' ) {
		const env = { ...process.env };
		RELEVANT.forEach( ( name ) => delete env[ name ] );
		const original = process.env;
		process.env = env;
		try {
			rows.push( {
				buildType: path.basename( file, '.xml' ).replace( /^RootProjectId_/, '' ),
				leg: 'no test group',
				configured: '(unset by the run step)',
				primed: getAccountNamesToPrime(),
			} );
		} finally {
			process.env = original;
		}
	}
}

if ( ! rows.length ) {
	console.error( `No generated configs under ${ configsRoot }. See the header of this file.` );
	process.exit( 1 );
}

for ( const row of rows.sort( ( a, b ) => a.buildType.localeCompare( b.buildType ) ) ) {
	const name = row.leg ? `${ row.buildType } [${ row.leg }]` : row.buildType;
	console.log( `\n${ name }` );
	console.log( `  set:    ${ row.configured || '(empty)' }` );
	console.log( `  primes: ${ row.primed.join( ', ' ) || '(nothing)' }` );
}
console.log( `\n${ rows.length } build type runs.` );
