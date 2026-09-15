import fs from 'fs';
import path from 'path';
import vm from 'vm';

const script = fs.readFileSync(
	path.resolve( __dirname, '../../../bin/build-languages.js' ),
	'utf8'
);

test( 'retains first matching references, exact file references, contexts, and missing-module behavior', async () => {
	const output = new Map();
	const translations = {
		'': {
			First: { comments: { reference: 'packages/example/src/shared.ts:1' } },
			Second: { comments: { reference: 'packages/example/src/shared.tsx:2' } },
			Exact: { comments: { reference: 'client/exact.js:3' } },
			Unreferenced: { comments: {} },
		},
		button: { First: { comments: { reference: 'packages/example/src/shared.ts:4' } } },
	};
	const chunks = {
		'first.js': [ 'packages/example/dist/esm/shared.js', 'client/exact.js', 'missing/module' ],
		'second.js': [ 'packages/example/dist/esm/shared.js' ],
	};
	const language = {
		First: [ 'Premier' ],
		Second: [ 'Deuxième' ],
		Exact: [ 'Exact' ],
		'button\u0004First': [ 'Bouton' ],
	};
	const write = ( filename, data ) => output.set( filename, data );
	const modules = {
		fs: {
			existsSync: () => true,
			mkdirSync: jest.fn(),
			readFileSync: () => '',
			writeFileSync: write,
			promises: { writeFile: write },
		},
		'@automattic/languages': { default: [ { langSlug: 'fr' } ] },
		'gettext-parser': { po: { parse: () => ( { translations } ) } },
		'.././public/chunks-map.json': chunks,
	};
	await vm.runInNewContext( script, {
		require: ( name ) => modules[ name ] ?? require( name ),
		console: { log: jest.fn() },
		fetch: async ( url ) => ( {
			status: 200,
			json: async () => ( url.endsWith( 'lang-revisions.json' ) ? { fr: 'revision' } : language ),
		} ),
	} );
	expect( JSON.parse( output.get( 'public/languages/fr-first.json' ) ) ).toEqual( {
		First: [ 'Premier' ],
		'button\u0004First': [ 'Bouton' ],
		Exact: [ 'Exact' ],
	} );
	expect( JSON.parse( output.get( 'public/languages/fr-second.json' ) ) ).toEqual( {
		First: [ 'Premier' ],
		'button\u0004First': [ 'Bouton' ],
	} );
	expect(
		JSON.parse( output.get( 'public/languages/fr-language-manifest.json' ) ).translatedChunks
	).toEqual( [ 'first', 'second' ] );
} );
