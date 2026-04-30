#!/usr/bin/env node

const { spawnSync } = require( 'child_process' );
const crypto = require( 'crypto' );
const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );

const DEFAULT_BUILD_COMMAND = 'yarn run build-css';
const DEFAULT_CSS_FILES = [ 'public/directly.css', 'public/reader-mobile.css' ];
const DEFAULT_TARGETS = [
	{
		name: 'standalone-css',
		command: DEFAULT_BUILD_COMMAND,
		cssFiles: DEFAULT_CSS_FILES,
	},
	{
		name: 'calypso-client',
		command: 'yarn run build-client',
		cssRoots: [ 'public/evergreen' ],
	},
	{
		name: 'notifications',
		command: 'NODE_ENV=production yarn workspace @automattic/notifications run dev',
		cssRoots: [ 'apps/notifications/dist' ],
	},
	{
		name: 'o2-blocks',
		command: 'NODE_ENV=production yarn workspace @automattic/o2-blocks run dev',
		cssRoots: [ 'apps/o2-blocks/dist' ],
	},
	{
		name: 'help-center',
		command: 'NODE_ENV=production yarn workspace @automattic/help-center-app run dev',
		cssRoots: [ 'apps/help-center/dist' ],
	},
	{
		name: 'wpcom-block-editor',
		command: 'NODE_ENV=production yarn workspace @automattic/wpcom-block-editor run dev',
		cssRoots: [ 'apps/wpcom-block-editor/dist' ],
	},
	{
		name: 'agents-manager',
		command: 'NODE_ENV=production yarn workspace @automattic/agents-manager-app run dev',
		cssRoots: [ 'apps/agents-manager/dist' ],
	},
	{
		name: 'happy-blocks',
		command: 'NODE_ENV=production yarn workspace happy-blocks run dev',
		cssRoots: [ 'apps/happy-blocks/block-library' ],
	},
	{
		name: 'blaze-dashboard',
		command: 'NODE_ENV=production yarn workspace @automattic/blaze-dashboard run dev',
		cssRoots: [ 'apps/blaze-dashboard/dist' ],
	},
	{
		name: 'odyssey-stats',
		command: 'NODE_ENV=production yarn workspace @automattic/odyssey-stats run dev',
		cssRoots: [ 'apps/odyssey-stats/dist' ],
	},
];

const args = parseArgs( process.argv.slice( 2 ) );

if ( args.help ) {
	printHelp();
	process.exit( 0 );
}

if ( args.listTargets ) {
	printTargets();
	process.exit( 0 );
}

const repoRoot = runCapture( 'git', [ 'rev-parse', '--show-toplevel' ], process.cwd() );
const headRef = args.head || 'HEAD';
const upstreamRef = args.upstream || 'origin/trunk';
const baseRef = args.base || runCapture( 'git', [ 'merge-base', headRef, upstreamRef ], repoRoot );
const installCommand = args.installCommand || 'yarn install --immutable';
const targets = resolveTargets();
const tempRoot = fs.mkdtempSync( path.join( os.tmpdir(), 'calypso-css-equivalence-' ) );
const worktrees = [];
let cleanupStarted = false;

main().catch( ( error ) => {
	console.error( error.message );
	process.exitCode = 1;
} );

process.once( 'SIGINT', () => exitWithCleanup( 'SIGINT', 130 ) );
process.once( 'SIGTERM', () => exitWithCleanup( 'SIGTERM', 143 ) );

async function main() {
	const baseCommit = resolveCommit( baseRef );
	const headCommit = resolveCommit( headRef );
	const baseDir = path.join( tempRoot, 'base' );
	const headDir = path.join( tempRoot, 'head' );
	let mismatchCount;

	console.log( `Base: ${ args.base ? baseRef : `merge-base(${ headRef }, ${ upstreamRef })` }` );
	console.log( `      ${ baseCommit }` );
	console.log( `Head: ${ headRef }` );
	console.log( `      ${ headCommit }` );
	console.log( 'Targets:' );
	for ( const target of targets ) {
		console.log( `  ${ target.name }: ${ target.command }` );
	}
	console.log( `Temporary worktrees: ${ tempRoot }` );

	try {
		addWorktree( baseDir, baseCommit );
		addWorktree( headDir, headCommit );

		await prepareWorktree( 'base', baseDir );
		await buildTargets( 'base', baseDir );
		await prepareWorktree( 'head', headDir );
		await buildTargets( 'head', headDir );

		mismatchCount = compareTargets( baseDir, headDir );
	} finally {
		if ( args.keepTemp ) {
			console.log( `Keeping temporary worktrees at ${ tempRoot }` );
		} else {
			cleanup();
		}
	}

	if ( mismatchCount > 0 ) {
		process.exitCode = 1;
	}

	console.log( `Total mismatches: ${ mismatchCount }` );
}

async function prepareWorktree( label, worktreeDir ) {
	console.log( `\n[${ label }] Preparing ${ worktreeDir }` );
	fs.mkdirSync( path.join( worktreeDir, 'public' ), { recursive: true } );

	if ( ! args.noInstall ) {
		runShell( installCommand, worktreeDir );
	}
}

async function buildTargets( label, worktreeDir ) {
	for ( const target of targets ) {
		console.log( `\n[${ label }] Building ${ target.name }` );
		runShell( target.command, path.join( worktreeDir, target.cwd || '.' ) );
	}
}

function compareTargets( baseDir, headDir ) {
	const failures = [];
	let comparedFiles = 0;

	for ( const target of targets ) {
		const files = filesForTarget( target, baseDir, headDir );

		if ( ! files.length ) {
			console.warn( `No CSS files found for ${ target.name }.` );
			continue;
		}

		comparedFiles += files.length;
		compareFiles( target.name, baseDir, headDir, files, failures );
	}

	if ( ! comparedFiles ) {
		throw new Error( 'No CSS files were found to compare.' );
	}

	if ( failures.length ) {
		console.error( '\nGenerated CSS is not byte equivalent:' );
		for ( const failure of failures ) {
			console.error( `- ${ failure.target }/${ failure.file }: ${ failure.message }` );
		}
		return failures.length;
	}

	console.log( `\nGenerated CSS is byte equivalent across ${ comparedFiles } files.` );
	return 0;
}

function compareFiles( targetName, baseDir, headDir, files, failures ) {
	for ( const file of files ) {
		const baseFile = path.join( baseDir, file );
		const headFile = path.join( headDir, file );

		if ( ! fs.existsSync( baseFile ) || ! fs.existsSync( headFile ) ) {
			failures.push( {
				target: targetName,
				file,
				message: `missing in ${ fs.existsSync( baseFile ) ? 'head' : 'base' } output`,
			} );
			continue;
		}

		const baseBytes = fs.readFileSync( baseFile );
		const headBytes = fs.readFileSync( headFile );

		if ( ! baseBytes.equals( headBytes ) ) {
			failures.push( {
				target: targetName,
				file,
				message: [
					`base ${ baseBytes.length } bytes sha256:${ sha256( baseBytes ) }`,
					`head ${ headBytes.length } bytes sha256:${ sha256( headBytes ) }`,
					`first differing byte: ${ firstDifferentByte( baseBytes, headBytes ) }`,
				].join( '; ' ),
			} );
			continue;
		}

		console.log(
			`Match: ${ targetName }/${ file } (${ headBytes.length } bytes sha256:${ sha256(
				headBytes
			) })`
		);
	}
}

function addWorktree( directory, commit ) {
	runCommand( 'git', [ 'worktree', 'add', '--detach', directory, commit ], repoRoot );
	worktrees.push( directory );
}

function cleanup() {
	if ( cleanupStarted ) {
		return;
	}

	cleanupStarted = true;

	for ( const worktree of worktrees.reverse() ) {
		runCommand( 'git', [ 'worktree', 'remove', '--force', worktree ], repoRoot, {
			ignoreFailure: true,
		} );
	}

	fs.rmSync( tempRoot, { recursive: true, force: true } );
}

function exitWithCleanup( signal, exitCode ) {
	console.error( `Received ${ signal }; cleaning up temporary worktrees.` );

	if ( ! args.keepTemp ) {
		cleanup();
	}

	process.exit( exitCode );
}

function filesForTarget( target, baseDir, headDir ) {
	if ( target.cssFiles?.length ) {
		return target.cssFiles;
	}

	return Array.from(
		new Set( [
			...findCssFiles( baseDir, target.cssRoots || [ 'public' ] ),
			...findCssFiles( headDir, target.cssRoots || [ 'public' ] ),
		] )
	).sort();
}

function findCssFiles( worktreeDir, roots ) {
	const files = [];

	for ( const root of roots ) {
		const rootDir = path.join( worktreeDir, root );

		if ( fs.existsSync( rootDir ) ) {
			walk( rootDir );
		}
	}

	return files.sort();

	function walk( directory ) {
		for ( const entry of fs.readdirSync( directory, { withFileTypes: true } ) ) {
			const entryPath = path.join( directory, entry.name );

			if ( entry.isDirectory() ) {
				walk( entryPath );
			} else if ( entry.isFile() && entry.name.endsWith( '.css' ) ) {
				files.push( path.relative( worktreeDir, entryPath ).split( path.sep ).join( '/' ) );
			}
		}
	}
}

function resolveCommit( ref ) {
	return runCapture( 'git', [ 'rev-parse', '--verify', `${ ref }^{commit}` ], repoRoot );
}

function runShell( command, cwd ) {
	const result = spawnSync( command, {
		cwd,
		env: { ...process.env, CI: process.env.CI || '1' },
		shell: true,
		stdio: 'inherit',
	} );

	if ( result.error ) {
		throw result.error;
	}

	if ( result.status !== 0 ) {
		throw new Error( `Command failed in ${ cwd }: ${ command }` );
	}
}

function runCommand( command, commandArgs, cwd, options = {} ) {
	const result = spawnSync( command, commandArgs, {
		cwd,
		encoding: 'utf8',
		stdio: options.capture ? [ 'ignore', 'pipe', 'pipe' ] : 'inherit',
	} );

	if ( result.error ) {
		if ( options.ignoreFailure ) {
			return '';
		}
		throw result.error;
	}

	if ( result.status !== 0 ) {
		if ( options.ignoreFailure ) {
			return '';
		}
		throw new Error(
			`Command failed: ${ [ command, ...commandArgs ].join( ' ' ) }${
				result.stderr ? `\n${ result.stderr.trim() }` : ''
			}`
		);
	}

	return options.capture ? result.stdout.trim() : '';
}

function runCapture( command, commandArgs, cwd ) {
	return runCommand( command, commandArgs, cwd, { capture: true } );
}

function sha256( bytes ) {
	return crypto.createHash( 'sha256' ).update( bytes ).digest( 'hex' );
}

function firstDifferentByte( left, right ) {
	const length = Math.min( left.length, right.length );

	for ( let index = 0; index < length; index++ ) {
		if ( left[ index ] !== right[ index ] ) {
			return index;
		}
	}

	return length;
}

function parseArgs( argv ) {
	const parsed = {
		allCss: false,
		buildCommand: '',
		cssFiles: [],
		head: '',
		help: false,
		installCommand: '',
		keepTemp: false,
		listTargets: false,
		noInstall: false,
		targets: [],
		upstream: '',
	};

	for ( let index = 0; index < argv.length; index++ ) {
		const arg = argv[ index ];

		if ( arg === '--all-css' ) {
			parsed.allCss = true;
		} else if ( arg === '--base' ) {
			parsed.base = requireValue( argv, ++index, arg );
		} else if ( arg === '--build-command' ) {
			parsed.buildCommand = requireValue( argv, ++index, arg );
		} else if ( arg === '--css-file' ) {
			parsed.cssFiles.push( requireValue( argv, ++index, arg ) );
		} else if ( arg === '--head' ) {
			parsed.head = requireValue( argv, ++index, arg );
		} else if ( arg === '--help' || arg === '-h' ) {
			parsed.help = true;
		} else if ( arg === '--install-command' ) {
			parsed.installCommand = requireValue( argv, ++index, arg );
		} else if ( arg === '--keep-temp' ) {
			parsed.keepTemp = true;
		} else if ( arg === '--list-targets' ) {
			parsed.listTargets = true;
		} else if ( arg === '--no-install' ) {
			parsed.noInstall = true;
		} else if ( arg === '--target' ) {
			parsed.targets.push( requireValue( argv, ++index, arg ) );
		} else if ( arg === '--upstream' ) {
			parsed.upstream = requireValue( argv, ++index, arg );
		} else {
			throw new Error( `Unknown argument: ${ arg }` );
		}
	}

	return parsed;
}

function resolveTargets() {
	if ( args.buildCommand ) {
		const customCssFiles = args.cssFiles.length ? args.cssFiles : DEFAULT_CSS_FILES;

		return [
			{
				name: 'custom',
				command: args.buildCommand,
				cssFiles: args.allCss ? [] : customCssFiles,
				cssRoots: [ 'public' ],
			},
		];
	}

	const targetNames = args.targets.length ? args.targets : [ 'all' ];

	if ( targetNames.includes( 'all' ) && targetNames.length > 1 ) {
		throw new Error( '--target all cannot be combined with other targets.' );
	}

	if ( targetNames.includes( 'all' ) ) {
		return DEFAULT_TARGETS;
	}

	const targetsByName = new Map( DEFAULT_TARGETS.map( ( target ) => [ target.name, target ] ) );

	return targetNames.map( ( targetName ) => {
		const target = targetsByName.get( targetName );

		if ( ! target ) {
			throw new Error( `Unknown target: ${ targetName }. Run with --list-targets to see options.` );
		}

		return target;
	} );
}

function requireValue( argv, index, flag ) {
	if ( index >= argv.length || argv[ index ].startsWith( '--' ) ) {
		throw new Error( `${ flag } requires a value.` );
	}

	return argv[ index ];
}

function printTargets() {
	console.log( 'Available targets:' );
	for ( const target of DEFAULT_TARGETS ) {
		const outputs = target.cssFiles || target.cssRoots || [ 'public' ];
		console.log( `  ${ target.name }` );
		console.log( `    build: ${ target.command }` );
		console.log( `    css:   ${ outputs.join( ', ' ) }` );
	}
}

function printHelp() {
	console.log( `Usage: node bin/check-css-byte-equivalence.js [options]

Builds generated CSS from two clean temporary worktrees and compares the output bytes.

Options:
  --base <ref>              Base revision. Defaults to merge-base(--head, --upstream).
  --head <ref>              Head revision. Default: HEAD.
  --upstream <ref>          Upstream ref used to infer the base. Default: origin/trunk.
  --target <name>           Target to build and compare. Can be repeated. Default: all.
  --list-targets            Print the default target list.
  --build-command <command> Custom single build command. Overrides --target.
                            Defaults to "${ DEFAULT_BUILD_COMMAND }" only in custom mode.
  --css-file <path>         CSS output to compare for --build-command mode. Can be repeated.
                            Defaults to ${ DEFAULT_CSS_FILES.join( ' and ' ) } in custom mode.
  --all-css                 Compare every .css file under public/ in --build-command mode.
  --install-command <cmd>   Install command. Default: "yarn install --immutable".
  --no-install              Skip dependency installation in the temporary worktrees.
  --keep-temp               Keep temporary worktrees for inspection.
  -h, --help                Show this help.

Examples:
  node bin/check-css-byte-equivalence.js
  node bin/check-css-byte-equivalence.js --target notifications --target o2-blocks
  node bin/check-css-byte-equivalence.js --base trunk --head mixed-decl-scss-2
  node bin/check-css-byte-equivalence.js --build-command "yarn run build-client" --all-css` );
}
