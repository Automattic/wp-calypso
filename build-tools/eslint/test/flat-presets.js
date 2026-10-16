/**
 * @jest-environment node
 */
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

test( 'the flat Node preset allows top-level return and Node globals', async () => {
	const config = [ flatNodeConfig, { rules: { 'no-undef': 'error' } } ];
	expect(
		await lint( config, 'if ( ! process.env.CI ) {\n\treturn;\n}\n', 'bin/script.js' )
	).toEqual( [] );
} );
