/**
 * External dependencies
 */
const { sync: spawn } = require( 'cross-spawn' );
const { sync: resolveBin } = require( 'resolve-bin' );

/**
 * Internal dependencies
 */
const {
	fromConfigRoot,
	getCliArgs,
	hasCliArg,
	hasProjectFile,
	hasPackageProp,
} = require( '../utils' );

const args = getCliArgs();

const hasLintConfig = hasCliArg( '-c' ) ||
	hasCliArg( '--configFile' ) ||
	hasProjectFile( '.npmpackagejsonlintrc.json' ) ||
	hasProjectFile( 'npmpackagejsonlint.config.js' ) ||
	hasPackageProp( 'npmPackageJsonLintConfig' );

const config = ! hasLintConfig ?
	[ '--configFile', fromConfigRoot( 'npmpackagejsonlint.json' ) ] :
	[];

const result = spawn(
	resolveBin( 'npm-package-json-lint', { executable: 'npmPkgJsonLint' } ),
	[ ...config, ...args ],
	{ stdio: 'inherit' }
);

process.exit( result.status );
