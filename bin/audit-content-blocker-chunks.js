#!/usr/bin/env node

/**
 * Checks the JavaScript and CSS files in a Calypso build against common
 * content-blocker filter lists, to catch chunk names that ad, tracker or
 * cookie-notice blockers would refuse to load (see #112944).
 *
 * The lists are configured in build-tools/content-blocker-audit/filter-lists.json
 * and cached in .cache/content-blocker-lists. Each run also checks a control:
 * a chunk name known to be blocked. If the control is not blocked, the lists or
 * the matcher stopped working and the run fails rather than passing silently.
 *
 * Audit a local build:
 * $ yarn build-client
 * $ node ./bin/audit-content-blocker-chunks.js
 *
 * Audit what is deployed, using the chunk maps in a page's webpack runtime:
 * $ node ./bin/audit-content-blocker-chunks.js --page https://wordpress.com/setup/onboarding/user
 *
 * Options:
 *   --dir <path>          Build output directory to scan (repeatable, default public/evergreen).
 *   --page <url>          Deployed page to read chunk URLs from instead (repeatable).
 *   --public-path <url>   URL the directory is served from (default https://wordpress.com/calypso/<dir name>/).
 *   --page-url <url>      Page that loads the assets (default https://wordpress.com/setup/onboarding/user).
 *   --cache-dir <path>    Where filter lists are cached (default .cache/content-blocker-lists).
 *   --refresh             Download the latest lists even if cached.
 *   --offline             Only use cached lists.
 *   --json <path>         Also write the full report as JSON.
 *
 * Exit codes: 0 nothing blocked, 1 some assets blocked, 2 control not blocked or error.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { parseArgs } = require( 'util' );
const {
	audit,
	buildMatcher,
	collectAssets,
	collectAssetsFromPage,
	fetchWithRetry,
	loadFilterLists,
} = require( '../build-tools/content-blocker-audit/audit' );
const config = require( '../build-tools/content-blocker-audit/filter-lists.json' );

const root = path.resolve( __dirname, '..' );

function formatMatches( matches ) {
	return matches
		.map( ( { list, line, rule } ) => `      ${ rule }  (${ list }:${ line })` )
		.join( '\n' );
}

async function main() {
	const { values } = parseArgs( {
		options: {
			dir: { type: 'string', multiple: true },
			page: { type: 'string', multiple: true },
			'public-path': { type: 'string' },
			'page-url': { type: 'string', default: 'https://wordpress.com/setup/onboarding/user' },
			'cache-dir': { type: 'string', default: '.cache/content-blocker-lists' },
			refresh: { type: 'boolean', default: false },
			offline: { type: 'boolean', default: false },
			json: { type: 'string' },
		},
	} );

	const dirs = values.dir ?? ( values.page ? [] : [ 'public/evergreen' ] );
	if ( values[ 'public-path' ] && dirs.length !== 1 ) {
		throw new Error( '--public-path can only be used with a single --dir' );
	}

	const lists = await loadFilterLists( config, {
		cacheDir: path.resolve( root, values[ 'cache-dir' ] ),
		offline: values.offline,
		refresh: values.refresh,
	} );

	const sources = dirs.map( ( dir ) => {
		const absoluteDir = path.resolve( root, dir );
		if ( ! fs.existsSync( absoluteDir ) ) {
			throw new Error(
				`${ dir } does not exist. Build Calypso first, e.g. \`yarn build-client\`.`
			);
		}
		const publicPath =
			values[ 'public-path' ] ?? `https://wordpress.com/calypso/${ path.basename( absoluteDir ) }/`;
		return {
			source: dir,
			publicPath,
			pageUrl: values[ 'page-url' ],
			assets: collectAssets( absoluteDir, publicPath ),
		};
	} );

	for ( const pageUrl of values.page ?? [] ) {
		sources.push( {
			source: pageUrl,
			pageUrl,
			...collectAssetsFromPage( await fetchWithRetry( pageUrl ), pageUrl ),
		} );
	}

	const matcher = buildMatcher( lists, config );
	const reports = sources.map( ( { source, publicPath, pageUrl, assets } ) => ( {
		source,
		publicPath,
		...audit( { lists, matcher, config, publicPath, pageUrl, assets } ),
	} ) );

	console.log( 'Filter lists:' );
	for ( const list of lists ) {
		console.log(
			`  ${ list.id }: ${ list.version ?? list.last_modified ?? 'unknown version' }${
				list.stale ? ' (cached; download failed)' : ''
			}`
		);
	}

	let exitCode = 0;
	for ( const report of reports ) {
		console.log(
			`\n${ report.source } (${ report.publicPath }): ${ report.assetsScanned } assets, ${ report.rulesEvaluated } relevant rules`
		);

		for ( const control of report.controls ) {
			console.log(
				`  Control ${ control.blocked ? 'blocked' : 'NOT BLOCKED' }: ${ control.name }`
			);
			if ( control.blocked ) {
				console.log( formatMatches( control.blockedBy ) );
			}
		}
		if ( ! report.controlsPassed ) {
			console.error(
				'  A known-blocked control name was not blocked, so this run cannot be trusted. Check the filter lists and matcher.'
			);
			exitCode = 2;
		}

		for ( const asset of report.allowedByException ) {
			console.log( `  Matched but allowed by an exception: ${ asset.name }` );
			console.log( formatMatches( asset.blockedBy ) );
		}

		if ( report.blocked.length ) {
			console.error( `  ${ report.blocked.length } asset(s) would be blocked:` );
			for ( const asset of report.blocked ) {
				console.error( `    ${ asset.name }` );
				console.error( formatMatches( asset.blockedBy ) );
			}
			exitCode = Math.max( exitCode, 1 );
		} else {
			console.log( '  No assets would be blocked.' );
		}
	}

	if ( values.json ) {
		fs.writeFileSync(
			path.resolve( root, values.json ),
			JSON.stringify( { lists: lists.map( ( { text, ...list } ) => list ), reports }, null, '\t' )
		);
	}

	process.exitCode = exitCode;
}

main().catch( ( error ) => {
	console.error( error.message );
	process.exitCode = 2;
} );
