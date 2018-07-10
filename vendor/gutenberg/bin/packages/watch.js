/**
 * External dependencies
 */
const fs = require( 'fs' );
const { execSync } = require( 'child_process' );
const path = require( 'path' );
const chalk = require( 'chalk' );

/**
 * Internal dependencies
 */
const getPackages = require( './get-packages' );

const BUILD_CMD = `node ${ path.resolve( __dirname, './build.js' ) }`;

let filesToBuild = new Map();

const exists = ( filename ) => {
	try {
		return fs.statSync( filename ).isFile();
	} catch ( e ) {}
	return false;
};

// Exclude deceitful source-like files, such as editor swap files.
const isSourceFile = ( filename ) => {
	return /.\.js$/.test( filename );
};

const rebuild = ( filename ) => filesToBuild.set( filename, true );

getPackages().forEach( ( p ) => {
	const srcDir = path.resolve( p, 'src' );
	try {
		fs.accessSync( srcDir, fs.F_OK );
		fs.watch( path.resolve( p, 'src' ), { recursive: true }, ( event, filename ) => {
			const filePath = path.resolve( srcDir, filename );

			if ( ! isSourceFile( filename ) ) {
				return;
			}

			if ( ( event === 'change' || event === 'rename' ) && exists( filePath ) ) {
				// eslint-disable-next-line no-console
				console.log( chalk.green( '->' ), `${ event }: ${ filename }` );
				rebuild( filePath );
			} else {
				const buildFile = path.resolve( srcDir, '..', 'build', filename );
				try {
					fs.unlinkSync( buildFile );
					process.stdout.write(
						chalk.red( '  \u2022 ' ) +
              path.relative( path.resolve( srcDir, '..', '..' ), buildFile ) +
              ' (deleted)' +
              '\n'
					);
				} catch ( e ) {}
			}
		} );
	} catch ( e ) {
		// doesn't exist
	}
} );

setInterval( () => {
	const files = Array.from( filesToBuild.keys() );
	if ( files.length ) {
		filesToBuild = new Map();
		try {
			execSync( `${ BUILD_CMD } ${ files.join( ' ' ) }`, { stdio: [ 0, 1, 2 ] } );
		} catch ( e ) {}
	}
}, 100 );

// eslint-disable-next-line no-console
console.log( chalk.red( '->' ), chalk.cyan( 'Watching for changes...' ) );
