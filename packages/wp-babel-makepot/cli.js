#!/usr/bin/env node

const os = require( 'os' );
const process = require( 'process' );
const program = require( 'commander' );
const glob = require( 'glob' );
const version = require( './package.json' ).version;
const presets = require( './presets' );
const processFiles = require( './process-files' );
const concatPot = require( './utils/concat-pot' );

const presetsKeys = Object.keys( presets );
const DEFAULT_JOBS = '1';

const getAvailableParallelism = () =>
	typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length;

const getMatchingFiles = ( patterns, ignore ) =>
	Array.from(
		new Set(
			patterns.flatMap( ( pattern ) =>
				glob.sync( pattern, { nodir: true, absolute: true, ignore } )
			)
		)
	).sort();

const resolveJobs = ( jobsOption, fileCount ) => {
	if ( jobsOption === 'auto' ) {
		return Math.min( 16, fileCount || 1, Math.max( 1, getAvailableParallelism() - 1 ) );
	}

	const jobs = Number.parseInt( jobsOption, 10 );

	if ( ! Number.isInteger( jobs ) || jobs < 1 ) {
		throw new Error( '`--jobs` must be a positive integer or `auto`.' );
	}

	return Math.min( jobs, fileCount || 1 );
};

program
	.version( version )
	.option(
		'-b, --base <type>',
		'Set a directory that will be used as a base for the relative file path references in comments'
	)
	.option(
		'-d, --dir <type>',
		'Change output directory.',
		( value ) => value.replace( /\/?$/, '/' ),
		'build/'
	)
	.option( '-i, --ignore <type>', 'Add pattern to exclude matches' )
	.option(
		'-p, --preset <type>',
		`Set babel preset. Available options: ${ presetsKeys.join( ', ' ) }`,
		'default'
	)
	.option(
		'-o, --output <type>',
		'Set the filename for POT concatenation output. Set `false` to disable concatenation.',
		'build/bundle-strings.pot'
	)
	.option(
		'-l, --lines-filter <file>',
		'JSON file containing files and line numbers filters. Only included line numbers will be passed.'
	)
	.option(
		'-j, --jobs <type>',
		'Number of worker threads to use for extraction. Use `auto` to match local parallelism.',
		DEFAULT_JOBS
	)
	.action( async ( command, [ files = '.' ] = [] ) => {
		if ( ! presetsKeys.includes( program.preset ) ) {
			throw new Error(
				`Invalid babel preset. Please use any of available options: ${ presetsKeys.join( ', ' ) }`
			);
		}

		// Replace `~` with actual home directory as glob can't use it.
		const filesGlob = files.trim().replace( /^~/, os.homedir() ).split( /\s/gm );
		const ignore = program.ignore && program.ignore.split( ',' );

		const { preset, dir, base, output, linesFilter } = program;
		const matchingFiles = getMatchingFiles( filesGlob, ignore );
		const jobs = resolveJobs( program.jobs, matchingFiles.length );

		await processFiles( matchingFiles, {
			jobs,
			preset,
			base,
			dir,
		} );

		if ( output && output !== 'false' ) {
			concatPot( dir, output, linesFilter );
		}
	} )
	.parseAsync( process.argv )
	.catch( ( error ) => {
		console.error( error.message );
		process.exitCode = 1;
	} );
