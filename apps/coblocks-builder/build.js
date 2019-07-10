const version = require( './package.json' ).version;
const exec = require( 'child_process' ).execSync;
const util = require( 'util' );
const rimraf = util.promisify( require( 'rimraf' ) );
const copyFile = require( 'fs' ).copyFileSync;
const unlink = require( 'fs' ).unlinkSync;
const mv = util.promisify( require( 'mv' ) );
const { readdirSync } = require( 'fs' );

const usedBlocks = [
	'row',
	'hero',
	'media-card',
	'gallery-masonry',
	'shape-divider',
	'dynamic-separator',
	'gallery-stacked',
	'gallery-carousel',
	'buttons',
	'pricing-table',
	'food-and-drinks',
	'icon',
	'features',
	'click-to-tweet',
	'highlight',
];

const filesToRemove = [
	'includes/class-coblocks-accordion-ie-support.php',
	'includes/class-coblocks-form.php',
	'includes/class-coblocks-google-map-block.php',
	'dist/js/coblocks-accordion-polyfill.min.js',
	'dist/js/coblocks-google-maps.min.js',
	'dist/js/coblocks-google-recaptcha.min.js',
];

const directoriesToRemove = [ 'includes/admin', 'src', 'dist/images/admin' ];

build();

async function build() {
	await removeDirectory( './coblocks' );
	await removeDirectory( './build' );
	cloneRelease( version );
	removedUnusedBlocks( usedBlocks );
	copy( './blocks.js', './coblocks/src/blocks.js' );
	copy( './class-coblocks.php', './coblocks/class-coblocks.php' );
	runCoBlocksBuild();
	await moveDirectory( './coblocks/build/coblocks', `./build/coblocks-${ version }` );
	await removeDirectory( './coblocks' );
	cleanBuild();
}

function removedUnusedBlocks( usedBlocks ) {
	console.log( `Removing unused block src` );
	const path = './coblocks/src/blocks';
	readdirSync( path, { withFileTypes: true } )
		.filter( directoryItem => directoryItem.isDirectory() )
		.map( directoryItem => directoryItem.name )
		.forEach( dir => {
			if ( ! usedBlocks.includes( dir ) ) {
				removeDirectory( `${ path }/${ dir }` );
			}
		} );
}

function removeDirectory( directory ) {
	console.log( `Removing directory  ${ directory }` );
	try {
		return rimraf( directory );
	} catch ( error ) {
		console.log( `There was an error removing ${ directory }: ${ error }` );
	}
}

function cloneRelease( version ) {
	console.log( `Cloning the CoBlocks branch for release ${ version }` );
	try {
		exec( `git clone --branch ${ version } https://github.com/godaddy/coblocks.git` );
	} catch ( error ) {
		console.log( `There was an error cloning the CoBlocks repo: ${ error }` );
	}
}

function copy( source, destination ) {
	console.log( `Copying ${ source } to ${ destination }` );
	try {
		copyFile( source, destination, () => console.log( 'success' ) );
	} catch ( error ) {
		console.log( `There was an error copying ${ source } to ${ destination }` );
	}
}

function removeFile( file ) {
	console.log( `Removing ${ file }` );
	try {
		unlink( file, () => console.log( 'success' ) );
	} catch ( error ) {
		console.log( `There was an error removing ${ file }` );
	}
}

function moveDirectory( source, destination ) {
	console.log( `Moving ${ source } to ${ destination }` );
	try {
		return mv( source, destination, { mkdirp: true } );
	} catch ( error ) {
		console.log( `There was an error moving ${ source } to ${ destination }` );
	}
}

function runCoBlocksBuild() {
	console.log( 'Running CoBlocks build ...' );
	try {
		exec( 'cd coblocks && npm install && grunt build', {
			maxBuffer: 1024 * 2000,
		} );
	} catch ( error ) {
		console.log( `There was an error running the CoBlocks build: ${ error }` );
	}
}

function cleanBuild() {
	directoriesToRemove.forEach( directory =>
		removeDirectory( `./build/coblocks-${ version }/${ directory }` )
	);
	filesToRemove.forEach( file => removeFile( `./build/coblocks-${ version }/${ file }` ) );
	copy(
		'./class-coblocks-register-blocks.php',
		`./build/coblocks-${ version }/includes/class-coblocks-register-blocks.php`
	);
}
