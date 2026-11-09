import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

const root = path.resolve( import.meta.dirname, '../..' );
const main = root;
const here = import.meta.dirname;
process.env.TZ = 'UTC';
const slice = fs.readFileSync( process.env.SLICE!, 'utf8' ).trim().split( '\n' );
const pkg = ( p: string ) => path.join( root, 'packages', p );

// Shared base: the parts every package's Jest config inherits from test/packages/jest-preset.js.
const base = defineConfig( {
	oxc: { include: /\.(m?ts|[jt]sx)$/, exclude: /node_modules/, jsx: { runtime: 'automatic' } },
	define: { __i18n_text_domain__: JSON.stringify( 'default' ) },
	resolve: {
		conditions: [ 'calypso:src', 'browser', 'development' ],
		mainFields: [ 'module', 'main' ],
		alias: [
			{ find: /^@automattic\/calypso-config$/, replacement: path.join( here, 'calypso-config.ts' ) },
			{ find: /^calypso\//, replacement: path.join( root, 'client' ) + '/' },
			{ find: /^@mswjs\/interceptors\/presets\/node$/, replacement: path.join( main, 'packages/calypso-jest/src/mswjs-interceptors-node-preset.js' ) },
			{ find: /^react-router$/, replacement: path.join( main, 'node_modules/react-router/dist/development/index.mjs' ) },
			{ find: /^react-router-dom$/, replacement: path.join( main, 'node_modules/react-router-dom/dist/index.mjs' ) },
		],
	},
	ssr: { resolve: { conditions: [ 'calypso:src', 'node', 'development' ] } },
	test: {
		globals: true,
		clearMocks: false,
		pool: 'vmForks',
		vmMemoryLimit: '1.5GB',
		maxWorkers: Math.max( 2, Math.round( os.availableParallelism() * 1.5 ) ),
		environment: 'node',
		setupFiles: [ path.join( here, 'vitest-setup-globals.ts' ), path.join( here, 'packages-setup.ts' ) ],
		server: { deps: { inline: [ 'nock', '@testing-library/user-event' ] } },
	},
} );

const project = ( name: string, overrides: any ) =>
	mergeConfig( base, {
		root: pkg( name ),
		...overrides,
		test: {
			name,
			include: slice.filter( ( f ) => f.startsWith( `packages/${ name }/` ) ).map( ( f ) => f.replace( `packages/${ name }/`, '' ) ),
			...overrides.test,
		},
	} );

export default defineConfig( {
	cacheDir: path.join( root, '.cache/vitest-packages' ),
	test: {
		projects: [
			project( 'api-core', { test: { environment: 'jsdom' } } ),
			project( 'agents-manager', { test: { environment: 'jsdom' } } ),
			project( 'domain-search', {
				test: { environment: 'jsdom', setupFiles: [ path.join( pkg( 'domain-search' ), 'src/test-helpers/setup.ts' ) ] },
			} ),
			project( 'help-center', {
				resolve: {
					alias: [ 'onboarding', 'data-stores', 'zendesk-client', 'calypso-products', 'components' ].map( ( m ) => ( {
						find: new RegExp( `^@automattic/${ m }$` ),
						replacement: path.join( pkg( 'help-center' ), `src/test/__mocks__/automattic-${ m }.js` ),
					} ) ),
				},
				test: { environment: 'jsdom', setupFiles: [ path.join( pkg( 'help-center' ), 'jestSetup.ts' ) ] },
			} ),
			project( 'image-studio', {
				resolve: {
					alias: [
						{ find: /^@automattic\/calypso-analytics$/, replacement: path.join( pkg( 'image-studio' ), 'src/__mocks__/@automattic/calypso-analytics.ts' ) },
						...[ 'data', 'core-data', 'block-editor', 'media-utils' ].map( ( m ) => ( {
							find: new RegExp( `^@wordpress/${ m }$` ),
							replacement: path.join( pkg( 'image-studio' ), `src/__mocks__/@wordpress/${ m }.ts` ),
						} ) ),
						{ find: /^.+\.(webp|png|jpe?g|gif|svg)$/, replacement: path.join( pkg( 'image-studio' ), 'src/__mocks__/fileMock.ts' ) },
					],
				},
				test: { environment: 'jsdom' },
			} ),
		],
	},
} );
