// The client directories whose tests run on Vitest, relative to `client/`. Jest skips their tests,
// Vitest runs them and ESLint bans the `jest` global in them, so a test can't end up in neither
// runner. Delete this file once every directory has moved and `yarn test-client` runs Vitest.
const path = require( 'node:path' );

const directories = [];

// Test files in `directories` that stay on Jest until a fix lands, relative to `client/`.
const onJest = [];

for ( const file of onJest ) {
	if ( ! directories.some( ( dir ) => file.startsWith( dir + '/' ) ) ) {
		throw new Error( `${ file } is listed to stay on Jest, but no Vitest directory contains it.` );
	}
}

const escapeRegExp = ( s ) => s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

// Jest's `testMatch`.
const vitestInclude = directories.map( ( dir ) => path.posix.join( dir, '**/test/*.[jt]s?(x)' ) );
const vitestExclude = onJest;

const jestIgnorePatterns = directories.map( ( dir ) => {
	const kept = onJest
		.filter( ( file ) => file.startsWith( dir + '/' ) )
		.map( ( file ) => escapeRegExp( file.slice( dir.length + 1 ) ) );
	const pattern = `^<rootDir>/${ escapeRegExp( dir ) }/`;
	return kept.length ? `${ pattern }(?!(?:${ kept.join( '|' ) })$)` : pattern;
} );

// Test files and the helpers next to them.
const eslintFiles = directories.map( ( dir ) =>
	path.posix.join( dir, '**/test/**/*.{js,jsx,ts,tsx}' )
);
const eslintIgnores = onJest;

// Shorthand properties, so that ES modules can import them by name.
module.exports = {
	directories,
	onJest,
	vitestInclude,
	vitestExclude,
	jestIgnorePatterns,
	eslintFiles,
	eslintIgnores,
};
