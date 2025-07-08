import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const configData = readFileSync( path.resolve( __dirname, 'config/development.json' ), 'utf8' );

export default defineConfig( {
	server: {
		port: 3000,
	},
	resolve: {
		conditions: [ 'module' ],
		alias: {
			'@automattic/components/src/styles/typography': path.resolve(
				__dirname,
				'packages/components/src/styles/_typography.scss'
			),
			'@automattic/components/src/styles/variables': path.resolve(
				__dirname,
				'packages/components/src/styles/_variables.scss'
			),
			'@automattic/components/src/summary-button': path.resolve(
				__dirname,
				'packages/components/src/summary-button'
			),
			'@automattic/odie-client/src/data': path.resolve(
				__dirname,
				'packages/odie-client/src/data'
			),
			'@automattic/calypso-router': path.resolve( __dirname, 'packages/calypso-router' ),
			'@automattic/': path.resolve( __dirname, 'packages/' ),
			wpcom: path.resolve( __dirname, 'packages/wpcom.js' ),
			'wpcom-proxy-request': path.resolve( __dirname, 'packages/wpcom-proxy-request' ),
			'wpcom-xhr-request': path.resolve( __dirname, 'packages/wpcom-xhr-request' ),
		},
	},
	define: {
		'window.configData': configData,
	},
	css: {
		preprocessorOptions: {
			scss: {
				// api: 'modern-compiler',
				silenceDeprecations: [
					'legacy-js-api',
					'import',
					'global-builtin',
					'css-function-mixin',
					'mixed-decls',
				],
				includePaths: [
					path.resolve( __dirname, 'packages' ),
					path.resolve( __dirname, 'packages/components/styles' ),
				],
				// importer: [
				// 	{
				// 		findFileUrl( url ) {
				// 			// Handle underscore prefixed partials
				// 			if ( ! url.startsWith( '_' ) && ! url.endsWith( '.scss' ) ) {
				// 				const underscoreUrl = url.replace( /([^/]+)$/, '_$1.scss' );
				// 				return new URL( underscoreUrl, import.meta.url );
				// 			}
				// 			return null;
				// 		},
				// 	},
				// ],
			},
		},
		modules: {
			// Enable CSS modules for .module.scss files
			localsConvention: 'camelCase',
		},
	},
	assetsInclude: [ '**/*.svg' ],
} );
