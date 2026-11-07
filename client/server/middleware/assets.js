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
		'entry-login': [
			'/client/assets/stylesheets/style.scss?direct',
			'/client/landing/login/index.js',
		],
		'entry-domains-landing': [
			'/client/assets/stylesheets/style.scss?direct',
			'/client/landing/domains/style.scss?direct',
			'/client/landing/domains/index.jsx',
		],
		'entry-subscriptions': [
			'/client/landing/subscriptions/styles/styles.scss?direct',
			'/client/landing/subscriptions/index.tsx',
		],
		'entry-browsehappy': [
			'/client/assets/stylesheets/style.scss?direct',
			'/client/landing/browsehappy/style.scss?direct',
			'/client/landing/browsehappy/circle.scss?direct',
		],
		'entry-dashboard-dotcom': [ '/client/dashboard/app-dotcom/index.ts' ],
		'entry-dashboard-a4a': [ '/client/dashboard/app-a4a/index.ts' ],
	},
};
const viteAssetType = ( asset ) => ( /\.(s?css)(\?|$)/.test( asset ) ? 'css.ltr' : 'js' );
const viteCssId = ( href ) => path.join( process.cwd(), href.replace( /[?&]direct$/, '' ) );
// PROTOTYPE (DOTMSD-1682): CALYPSO_VITE_SECTION_CSS = walk (default) | startup | combined | none.
const SECTION_CSS_MODE = process.env.CALYPSO_VITE_SECTION_CSS ?? 'walk';
function viteAssetsHandler( req, res, next ) {
	const closures = {};
	req.getAssets = () => VITE_ASSETS;
	// Async: work out the static CSS closure of the entry and section before the sync getters run.
	req.prepareChunkGroups = async ( entrypoint, section ) => {
		if ( SECTION_CSS_MODE === 'none' ) {
			return;
		}
		const sectionCss = await globalThis.__viteSectionCss;
		const entryJs = ( VITE_ASSETS.assets[ entrypoint ] ?? [] ).filter(
			( f ) => viteAssetType( f ) === 'js'
		);
		const sectionUrl = section && ( await sectionCss.resolveUrl( section.module ) );
		const groups = [ [ entrypoint, entryJs, [] ] ];
		if ( sectionUrl ) {
			groups.push( [ section.name, [ sectionUrl ], entryJs ] );
		}
		for ( const [ name, entries, exclude ] of groups ) {
			if ( ! entries.length ) {
				continue;
			}
			if ( SECTION_CSS_MODE === 'combined' ) {
				const k = encodeURIComponent( JSON.stringify( { entries, exclude } ) );
				closures[ name ] = [ { href: `/@calypso/combined-css?k=${ k }&.css` } ];
			} else {
				closures[ name ] = await sectionCss.cssFor( entries, exclude );
			}
		}
	};
	req.getFilesForChunkGroup = ( name ) => {
		const files = VITE_ASSETS.assets[ name ] ?? [];
		const base = name.startsWith( 'entry-dashboard' )
			? [ ...VITE_DASHBOARD_STYLES, ...files ]
			: files;
		const sheets = closures[ name ] ?? [];
		if ( ! base.length && ! sheets.length ) {
			return EMPTY_ASSETS;
		}
		const grouped = defaults( groupBy( base, viteAssetType ), EMPTY_ASSETS );
		const linked = new Set( grouped[ 'css.ltr' ] );
		const viteIds = {};
		for ( const href of grouped[ 'css.ltr' ] ) {
			viteIds[ href ] = viteCssId( href );
		}
		for ( const sheet of sheets ) {
			if ( ! linked.has( sheet.href ) ) {
				linked.add( sheet.href );
				grouped[ 'css.ltr' ] = [ ...grouped[ 'css.ltr' ], sheet.href ];
				if ( sheet.id ) {
					viteIds[ sheet.href ] = sheet.id;
				}
			}
		}
		return { ...grouped, viteIds };
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
