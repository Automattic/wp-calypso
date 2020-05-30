const fs = require( 'fs' );
const path = require( 'path' );
const digestPackagesDir = require( './calculate-packages-checksum' );
const chalk = require( 'chalk' );

const checksumFilePath = path.join( __dirname, '..', 'packages', 'packages-checksum.txt' );

// map exit code to answer for less confusion
const ANSWERS = {
	YES: 0,
	NO: 1,
};

async function shouldRebuild() {
	// if checksum file doesn't exist, it means they were never built
	if ( ! fs.existsSync( checksumFilePath ) ) {
		process.exit( ANSWERS.YES );
	}

	const storedChecksum = ( await fs.promises.readFile( checksumFilePath ) ).toString();
	const freshChecksum = await digestPackagesDir();

	if ( storedChecksum === freshChecksum ) {
		console.log( chalk.blue( 'Calypso packages are already freshly built ✨' ) );
		process.exit( ANSWERS.NO );
	} else {
		process.exit( ANSWERS.YES );
	}
}

shouldRebuild();
