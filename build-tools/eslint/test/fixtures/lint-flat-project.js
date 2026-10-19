// Lints a generated project with the flat presets set up as their READMEs show, with and without
// the cache, and prints `{ uncached, cached }` results per file as JSON.
const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const { flatNodeConfig } = require( '@automattic/calypso-eslint-overrides' );
const json = require( '@automattic/eslint-plugin-json' );
const { loadESLint } = require( 'eslint' );
const { defineConfig } = require( 'eslint/config' );
const react = require( 'eslint-plugin-react' );
const wpcalypso = require( 'eslint-plugin-wpcalypso' );

// eslint-disable-next-line wpcalypso/i18n-unlocalized-url -- the input that rule should flag
const url = 'https://wordpress.com/support/';
const files = {
	// eslint-disable-next-line inclusive-language/use-inclusive-words -- the input that rule should flag
	'index.js': `export const help = '${ url }';\n// whitelist\n`,
	'component.jsx': 'export const Example = () => <div />;\n',
	// Multiline arguments without a trailing comma, as WordPress's Prettier style prints them.
	'call.js': 'export const sum = ( a, b ) => a + b;\nsum(\n\t1,\n\t2\n);\n',
	'test/index.js': `export const help = '${ url }';\n`,
	'data.json': `{ "help": "${ url }" }\n`,
	'package.json': '{}\n',
	'README.md': '# Example\n',
	'bin/module.js': "import fs from 'node:fs';\nfs.readFileSync( process.argv[ 2 ] );\n",
	'bin/script.cjs': 'if ( ! process.env.CI ) {\n\treturn;\n}\n',
};

const config = defineConfig( [
	{ files: [ '**/*.{js,jsx,cjs}' ], extends: [ wpcalypso.configs.react ] },
	{ files: [ '**/*.json' ], extends: [ json.configs.recommended ] },
	{ ...flatNodeConfig, files: [ 'bin/**' ] },
	// Projects often add the React plugin's own config; the preset must register the same plugin.
	{ files: [ '**/*.{js,jsx}' ], ...react.configs.flat[ 'jsx-runtime' ] },
] );

( async () => {
	const dir = fs.mkdtempSync( path.join( os.tmpdir(), 'flat-presets-' ) );
	for ( const [ name, content ] of Object.entries( files ) ) {
		fs.mkdirSync( path.dirname( path.join( dir, name ) ), { recursive: true } );
		fs.writeFileSync( path.join( dir, name ), content );
	}
	const ESLint = await loadESLint( { useFlatConfig: true } );
	const lint = async ( options ) => {
		const eslint = new ESLint( {
			cwd: dir,
			overrideConfigFile: true,
			overrideConfig: config,
			...options,
		} );
		const results = await eslint.lintFiles( [ '.' ] );
		return Object.fromEntries(
			results.map( ( result ) => [
				path.relative( dir, result.filePath ),
				{
					fatal: result.messages.some( ( message ) => message.fatal ),
					rules: [ ...new Set( result.messages.map( ( message ) => message.ruleId ) ) ].sort(),
				},
			] )
		);
	};
	const uncached = await lint( {} );
	const cached = await lint( { cache: true, cacheLocation: path.join( dir, '.eslintcache' ) } );
	fs.rmSync( dir, { recursive: true, force: true } );
	process.stdout.write( JSON.stringify( { uncached, cached } ) );
} )();
