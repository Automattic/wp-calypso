/**
 * @jest-environment node
 */
const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const { flatNodeConfig } = require( '@automattic/calypso-eslint-overrides' );
const jsonPlugin = require( '@automattic/eslint-plugin-json' );
const { loadESLint } = require( 'eslint' );

const repoRoot = path.resolve( __dirname, '../../..' );

// Each preset spread as documented, with nothing the consumer would add.
const lint = async ( overrideConfig, code, file ) => {
	const ESLint = await loadESLint( { useFlatConfig: true } );
	const eslint = new ESLint( { cwd: repoRoot, overrideConfigFile: true, overrideConfig } );
	const [ result ] = await eslint.lintText( code, { filePath: path.join( repoRoot, file ) } );
	return result.messages.map(
		( { ruleId, fatal, message } ) => ruleId ?? ( fatal ? 'fatal' : message )
	);
};

test( 'the flat JSON preset lints JSON files, package.json rules included, and leaves JavaScript alone', async () => {
	const preset = jsonPlugin.configs[ 'flat/recommended' ];
	expect( await lint( preset, '{\n\t// note\n\t"a": 1\n}\n', 'src/data.json' ) ).toEqual( [
		'json-es/no-comments',
	] );
	expect( await lint( preset, '{}\n', 'src/package.json' ) ).toContain(
		'@automattic/json/require-name'
	);
	expect( await lint( preset, 'export default 1;\n', 'src/index.js' ) ).toEqual( [] );
} );

// Without this, `eslint --cache` can't hash a config that uses the JSON preset.
test( 'the flat JSON preset works with the ESLint cache', async () => {
	const ESLint = await loadESLint( { useFlatConfig: true } );
	const cacheLocation = path.join( fs.mkdtempSync( path.join( os.tmpdir(), 'eslint-' ) ), 'cache' );
	const eslint = new ESLint( {
		cwd: repoRoot,
		overrideConfigFile: true,
		overrideConfig: jsonPlugin.configs[ 'flat/recommended' ],
		cache: true,
		cacheLocation,
	} );
	await expect(
		eslint.lintFiles( [ 'packages/eslint-plugin-package-json/package.json' ] )
	).resolves.toHaveLength( 1 );
} );

test( 'the flat Node preset keeps ES modules and allows top-level return in scripts', async () => {
	const config = [ flatNodeConfig, { rules: { 'no-undef': 'error' } } ];
	const esModule = "import fs from 'node:fs';\nfs.readFileSync( process.argv[ 2 ] );\n";
	expect( await lint( config, esModule, 'bin/script.js' ) ).toEqual( [] );
	expect(
		await lint(
			[ { languageOptions: { sourceType: 'script' } }, ...config ],
			'if ( ! process.env.CI ) {\n\treturn;\n}\n',
			'bin/script.js'
		)
	).toEqual( [] );
} );
