/**
 * @jest-environment node
 */
const { spawnSync } = require( 'child_process' );
const path = require( 'path' );
const { flatNodeConfig } = require( '@automattic/calypso-eslint-overrides' );
const { loadESLint } = require( 'eslint' );

const repoRoot = path.resolve( __dirname, '../../..' );

// Without this, the flat presets can work in isolation yet break the documented setup:
// skip JSX, parse JSON or Markdown as JavaScript, lose top-level `return`, or fail with `--cache`.
test( 'the flat presets lint a project as their READMEs set them up', () => {
	// A separate process: Jest can't require() ES-module plugins such as eslint-plugin-jsdoc.
	const run = spawnSync(
		process.execPath,
		[ path.join( __dirname, 'fixtures/lint-flat-project.js' ) ],
		{
			encoding: 'utf8',
		}
	);
	if ( run.status !== 0 ) {
		throw new Error( `lint-flat-project exited with ${ run.status }:\n${ run.stderr }` );
	}
	const { uncached, cached } = JSON.parse( run.stdout );
	const clean = { fatal: false, rules: [] };

	expect( uncached ).toEqual( {
		'index.js': {
			fatal: false,
			rules: [ 'inclusive-language/use-inclusive-words', 'wpcalypso/i18n-unlocalized-url' ],
		},
		'component.jsx': clean,
		'call.js': clean,
		// The test-file exception.
		'test/index.js': clean,
		// JSON gets the JSON parser and rules only; Markdown isn't linted at all.
		'data.json': clean,
		'package.json': {
			fatal: false,
			rules: [
				'@automattic/json/require-author',
				'@automattic/json/require-description',
				'@automattic/json/require-license',
				'@automattic/json/require-name',
				'@automattic/json/require-version',
			],
		},
		'bin/module.js': clean,
		'bin/script.cjs': clean,
	} );
	expect( cached ).toEqual( uncached );
}, 60000 );

// Without this, ESLint's default parser turns `globalReturn` off on the shared preset object
// after one ES module, and later scripts in the same run reject top-level `return`.
test( 'the flat Node preset keeps top-level return for scripts after linting an ES module', async () => {
	const ESLint = await loadESLint( { useFlatConfig: true } );
	const lint = async ( overrideConfig, code ) => {
		const eslint = new ESLint( { cwd: repoRoot, overrideConfigFile: true, overrideConfig } );
		const [ result ] = await eslint.lintText( code, {
			filePath: path.join( repoRoot, 'bin/x.js' ),
		} );
		return result.messages.map( ( { ruleId, message } ) => ruleId ?? message );
	};
	expect(
		await lint( [ flatNodeConfig ], "import fs from 'node:fs';\nfs.readFileSync( 'x' );\n" )
	).toEqual( [] );
	expect(
		await lint(
			[ { languageOptions: { sourceType: 'script' } }, flatNodeConfig ],
			'if ( x ) {\n\treturn;\n}\n'
		)
	).toEqual( [] );
} );
