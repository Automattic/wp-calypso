#!/usr/bin/env node

/**
 * External dependencies
 */
const program = require( 'commander' );
const process = require( 'process' );
const glob = require( 'glob' );
const os = require( 'os' );

/**
 * Internal dependencies
 */
const makePot = require( './index' );
const presets = require( './presets' );
const concatPot = require( './utils/concat-pot' );
const version = require( './package.json' ).version;

const presetsKeys = Object.keys( presets );

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
	.action( ( command, [ files = '.' ] = [] ) => {
		if ( ! presetsKeys.includes( program.preset ) ) {
			console.log(
				`Invalid babel preset. Please use any of available options: ${ presetsKeys.join( ', ' ) }`
			);

			return;
		}

		// Replace `~` with actual home directory as glob can't use it.
		const filesGlob = files.trim().replace( /^~/, os.homedir() ).split( /\s/gm );
		const ignore = program.ignore && program.ignore.split( ',' );

		const { dir, base, output, linesFilter } = program;

		filesGlob.forEach( ( pattern ) => {
			glob.sync( pattern, { nodir: true, absolute: true, ignore } ).forEach( ( filepath ) =>
				makePot( filepath, {
					base,
					dir,
				} )
			);
		} );

		if ( output && output !== 'false' ) {
			concatPot( dir, output, linesFilter );
		}
	} )
	.parse( process.argv );
