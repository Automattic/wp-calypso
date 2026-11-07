import { open } from 'fs/promises';
import path from 'path';
import { defaults, groupBy } from '@automattic/js-utils';
import asyncHandler from 'express-async-handler';

const ASSETS_PATH = path.resolve( __dirname, '../../../build' );
const ASSETS_FILE = path.join( ASSETS_PATH, `assets.json` );
const EMPTY_ASSETS = { js: [], 'css.ltr': [], 'css.rtl': [] };

const getAssetType = ( asset ) => {
	if ( asset.endsWith( '.rtl.css' ) ) {
		return 'css.rtl';
	}
	if ( asset.endsWith( '.css' ) ) {
		return 'css.ltr';
	}

	return 'js';
};

const groupAssetsByType = ( assets ) => defaults( groupBy( assets, getAssetType ), EMPTY_ASSETS );

// PROTOTYPE (DOTMSD-1679): assets provider for Vite. Entries are source URLs served by the Vite
// middleware; sections load through `import()`, so their chunk groups are empty.
const VITE_DASHBOARD_STYLES = [
	'/packages/omnibar/src/style.scss?direct',
	'/client/dashboard/app/omnibar/style.scss?direct',
];
const VITE_ASSETS = {
	manifests: [],
	assets: {
		'entry-main': [ '/client/assets/stylesheets/style.scss?direct', '/client/boot/app.js' ],
		'entry-stepper': [
			'/client/assets/stylesheets/style.scss?direct',
			'/client/landing/stepper/index.tsx',
		],
		'entry-dashboard-dotcom': [ '/client/dashboard/app-dotcom/index.ts' ],
		'entry-dashboard-a4a': [ '/client/dashboard/app-a4a/index.ts' ],
	},
};
const viteAssetType = ( asset ) => ( /\.(s?css)(\?|$)/.test( asset ) ? 'css.ltr' : 'js' );
function viteAssetsHandler( req, res, next ) {
	req.getAssets = () => VITE_ASSETS;
	req.getFilesForChunkGroup = ( name ) => {
		const files = VITE_ASSETS.assets[ name ];
		if ( ! files ) {
			return EMPTY_ASSETS;
		}
		const all = name.startsWith( 'entry-dashboard' )
			? [ ...VITE_DASHBOARD_STYLES, ...files ]
			: files;
		return defaults( groupBy( all, viteAssetType ), EMPTY_ASSETS );
	};
	req.getEmptyAssets = () => EMPTY_ASSETS;
	next();
}

/**
 * @returns {import('express').RequestHandler}
 */
export default () => {
	if ( process.env.CALYPSO_BUNDLER === 'vite' ) {
		return viteAssetsHandler;
	}
	let assetsFile = null;
	let assetsFileModified = 0;
	async function doReadAssets() {
		const fd = await open( ASSETS_FILE );
		const stats = await fd.stat();
		if ( ! assetsFile || stats.mtimeMs > assetsFileModified ) {
			assetsFile = JSON.parse( await fd.readFile( 'utf8' ) );
			assetsFileModified = stats.mtimeMs;
		}
		await fd.close();
		return assetsFile;
	}

	let checking = null;
	function readAssets() {
		if ( ! checking ) {
			checking = doReadAssets().finally( () => {
				checking = null;
			} );
		}

		return checking;
	}

	return asyncHandler( async ( req, res, next ) => {
		const assets = await readAssets();

		req.getAssets = () => assets;

		req.getFilesForChunkGroup = ( name ) => {
			const chunkGroupAssets = assets.assets[ name ];
			if ( ! chunkGroupAssets ) {
				console.warn( 'cannot find chunk group ' + chunkGroupAssets );
				console.warn( 'available chunk groups:' );
				for ( const availName of Object.keys( assets.assets ) ) {
					console.log( '    ' + availName );
				}
				return EMPTY_ASSETS;
			}
			return groupAssetsByType( chunkGroupAssets );
		};

		req.getEmptyAssets = () => EMPTY_ASSETS;

		next();
	} );
};
