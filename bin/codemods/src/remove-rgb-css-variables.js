const fs = require( 'fs' );
const { glob } = require( 'glob' );

// Function to remove SCSS variables ending with '-rgb'
const removeRgbVariables = ( scssContent ) => {
	// Regular expression to match lines that define '-rgb' variables along with comments
	const rgbVarRegex = /^\s*--.*-rgb\s*:\s*[^;]*;\s*(?:\/\/.*|\/\*[\s\S]*?\*\/)?\s*\n?/gm;

	// Remove lines with '-rgb' variables (will not leave empty lines)
	return scssContent.replace( rgbVarRegex, '\t' );
};

// Function to process files in a specific directory
const processScssFiles = async ( rootDir ) => {
	const scssFiles = glob.sync( `${ rootDir }/**/*.scss`, {
		ignore: [ '**/node_modules/**' ],
	} );

	console.log( `Processing ${ rootDir }/**/*.scss, found`, scssFiles.length, 'files' );

	scssFiles.forEach( async ( filePath ) => {
		const scssCode = fs.readFileSync( filePath, 'utf8' );
		const fixedScssCode = removeRgbVariables( scssCode );

		if ( scssCode !== fixedScssCode ) {
			fs.writeFileSync( filePath, fixedScssCode, 'utf8' );
			console.log( `Fixed SCSS: ${ filePath }` );
		}
	} );
};

// Run the codemod with a specified directory
const rootDir = process.argv[ 2 ];

if ( ! rootDir ) {
	console.error( 'Usage: node remove-rgb-css-variables.js <scss_directory>' );
	process.exit( 1 );
}

// Run the cleanup process
processScssFiles( rootDir )
	.then( () => console.log( 'CSS variable cleanup complete!' ) )
	.catch( ( err ) => console.error( 'An error occurred:', err ) );
