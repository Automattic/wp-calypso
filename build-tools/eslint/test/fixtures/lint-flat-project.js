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

const eslintMajor = Number( require( 'eslint/package.json' ).version.split( '.' )[ 0 ] );
// The copy the JSON plugin itself loads, which isn't a direct dependency here.
const jsonEs = require(
	require.resolve( 'eslint-plugin-json-es', {
		paths: [ require.resolve( '@automattic/eslint-plugin-json' ) ],
	} )
);

// eslint-disable-next-line wpcalypso/i18n-unlocalized-url -- the input that rule should flag
const url = 'https://wordpress.com/support/';
const files = {
	'index.js': `export const help = '${ url }';\n`,
	'component.jsx': 'export const Example = () => <div />;\n',
	'test/index.js': `export const help = '${ url }';\n`,
	'data.json': `{ "help": "${ url }" }\n`,
	'package.json': '{}\n',
	'README.md': '# Example\n',
	'bin/module.js': "import fs from 'node:fs';\nfs.readFileSync( process.argv[ 2 ] );\n",
	'bin/script.cjs': 'if ( ! process.env.CI ) {\n\treturn;\n}\n',
};

const config = defineConfig( [
	{ files: [ '**/*.{js,jsx}' ], extends: [ wpcalypso.configs[ 'flat/react' ] ] },
	{ files: [ '**/*.json' ], extends: [ json.configs[ 'flat/recommended' ] ] },
	{ ...flatNodeConfig, files: [ 'bin/**' ] },
	// Projects often add the React plugin's own config; the preset must register the same plugin.
	{ files: [ '**/*.{js,jsx}' ], ...react.configs.flat[ 'jsx-runtime' ] },
	// Before ESLint 10, the presets register the plugins they wrap there as is, so projects can too.
	...( eslintMajor < 10
		? [
				{
					files: [ '**/*.{js,jsx}' ],
					plugins: { 'inclusive-language': require( 'eslint-plugin-inclusive-language' ) },
				},
				{ files: [ '**/*.json' ], plugins: { 'json-es': jsonEs } },
			]
		: [] ),
	// Stands in for the Babel config a real project has.
	{
		files: [ '**/*.{js,jsx}' ],
		languageOptions: {
			parserOptions: {
				requireConfigFile: false,
				babelOptions: { presets: [ require.resolve( '@babel/preset-react' ) ] },
			},
		},
	},
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
