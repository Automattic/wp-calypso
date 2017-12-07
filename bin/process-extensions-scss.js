#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'node-sass' );

function getExtensionsWithScss() {
	const extensionsDirectory = path.resolve( __dirname, '..', 'client', 'extensions' );
	const extensionsNames = fs.readdirSync( extensionsDirectory ).filter( filename => {
		// Return if this is a file (has extension)
		if ( filename.indexOf( '.' ) !== -1 ) {
			return false;
		}
		// Check for a package.json
		const packageJsonPath = path.resolve( extensionsDirectory, filename, 'package.json' );
		if ( ! fs.existsSync( packageJsonPath ) ) {
			return false;
		}
		// Use package.json to check if there is a `css` definition for this extension's section
		const packageJson = JSON.parse( fs.readFileSync( packageJsonPath, 'utf8' ) );
		return !! packageJson.section.css;
	} );

	return extensionsNames.map( extensionName => path.resolve( extensionsDirectory, extensionName ) );
}

const extensions = getExtensionsWithScss();

extensions.forEach( extension => {
	const outFile = path.resolve(
		__dirname,
		'..',
		'public',
		'sections',
		path.basename( extension ) + '.css'
	);
	sass.render(
		{
			file: path.resolve( extension, 'style.scss' ),
			outFile: outFile,
			includePaths: [ path.resolve( __dirname, '..', 'client' ) ],
			sourceMap: true,
			outputStyle: 'compressed',
		},
		( error, result ) => {
			if ( error ) {
				console.warn( 'Failed to process scss', extension, error );
				return;
			}
			// No errors during the compilation, write this result on the disk
			fs.writeFile( outFile, result.css, fileError => {
				if ( fileError ) {
					console.warn( 'Failed to save CSS', extension, fileError );
				}
			} );
			fs.writeFile( outFile + '.map', result.map, fileError => {
				if ( fileError ) {
					console.warn( 'Failed to save sourcemap', extension, fileError );
				}
			} );
		}
	);
} );
