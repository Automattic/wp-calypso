import fs from 'fs';
import os from 'os';
import path from 'path';
import {
	audit,
	collectAssets,
	collectAssetsFromPage,
	fetchWithRetry,
	loadFilterLists,
} from '../audit';
import config from '../filter-lists.json';

const PAGE_URL = 'https://wordpress.com/setup/onboarding/user';
const PUBLIC_PATH = 'https://wordpress.com/calypso/evergreen/';

function makeList( id, rules ) {
	return { id, url: `https://example.com/${ id }.txt`, text: rules.join( '\n' ) };
}

describe( 'collectAssets', () => {
	test( 'lists JavaScript and CSS files as URLs under the public path', () => {
		const dir = fs.mkdtempSync( path.join( os.tmpdir(), 'content-blocker-audit-' ) );
		try {
			fs.mkdirSync( path.join( dir, 'images' ) );
			for ( const file of [
				'entry-main.abc.min.js',
				'entry-main.abc.min.js.map',
				'entry-main.abc.min.css',
				'entry-main.abc.rtl.min.css',
				'images/logo.png',
				'images/inline.abc.min.js',
			] ) {
				fs.writeFileSync( path.join( dir, file ), '' );
			}

			expect( collectAssets( dir, PUBLIC_PATH ) ).toEqual( [
				{
					name: 'entry-main.abc.min.css',
					url: `${ PUBLIC_PATH }entry-main.abc.min.css`,
					type: 'stylesheet',
				},
				{
					name: 'entry-main.abc.min.js',
					url: `${ PUBLIC_PATH }entry-main.abc.min.js`,
					type: 'script',
				},
				{
					name: 'entry-main.abc.rtl.min.css',
					url: `${ PUBLIC_PATH }entry-main.abc.rtl.min.css`,
					type: 'stylesheet',
				},
				{
					name: 'images/inline.abc.min.js',
					url: `${ PUBLIC_PATH }images/inline.abc.min.js`,
					type: 'script',
				},
			] );
		} finally {
			fs.rmSync( dir, { recursive: true, force: true } );
		}
	} );
} );

describe( 'collectAssetsFromPage', () => {
	const html = `
		<link rel="stylesheet" type="text/css" href="/calypso/evergreen/entry-stepper.c1.min.css" data-webpack="true"/>
		<script>
			c.p="/calypso/evergreen/";
			c.u=a=>""+(({90:"onboarding-unified-flow",60977:"async-load-calypso-blocks-privacy-prefs"})[a]||a)+"."+({80:"h80",90:"h90",60977:"h60977"})[a]+".min.js",
			c.miniCssF=a=>""+(({60977:"async-load-calypso-blocks-privacy-prefs"})[a]||a)+"."+{60977:"c60977"}[a]+".min.css";
		</script>
		<script src="/calypso/evergreen/entry-stepper.e1.min.js"></script>
		<script src="https://s0.wp.com/wp-includes/js/jquery.min.js"></script>
		<script src="/wp-content/js/bilmur.min.js"></script>
	`;

	test( 'reads chunk URLs from the webpack runtime and the page', () => {
		const { publicPath, assets } = collectAssetsFromPage( html, PAGE_URL );
		expect( publicPath ).toBe( PUBLIC_PATH );
		expect( assets.map( ( { name, type } ) => `${ type } ${ name }` ) ).toEqual( [
			'script 80.h80.min.js',
			'stylesheet async-load-calypso-blocks-privacy-prefs.c60977.min.css',
			'stylesheet async-load-calypso-blocks-privacy-prefs.c60977.min.rtl.css',
			'script async-load-calypso-blocks-privacy-prefs.h60977.min.js',
			'stylesheet entry-stepper.c1.min.css',
			'script entry-stepper.e1.min.js',
			'script onboarding-unified-flow.h90.min.js',
		] );
	} );

	test( 'reads the chunk maps when the minifier drops the leading empty string', () => {
		// Production serves `.u=e=>(({…})[e]||e)+"."+({…})[e]+".min.js"`.
		const minified = html.replaceAll( '""+', '' );
		expect( minified ).not.toBe( html );
		expect( collectAssetsFromPage( minified, PAGE_URL ).assets ).toEqual(
			collectAssetsFromPage( html, PAGE_URL ).assets
		);
	} );

	test( 'says when the page is a bot challenge', () => {
		expect( () =>
			collectAssetsFromPage( '<script src="/__challenge/probes.js"></script>', PAGE_URL )
		).toThrow( 'bot challenge' );
	} );

	test( 'fails loudly when the runtime cannot be parsed', () => {
		expect( () => collectAssetsFromPage( '<html></html>', PAGE_URL ) ).toThrow(
			'Could not find the webpack public path'
		);
		expect( () => collectAssetsFromPage( 'c.p="/calypso/evergreen/"', PAGE_URL ) ).toThrow(
			'Could not find webpack chunk maps'
		);
	} );
} );

describe( 'audit', () => {
	const assets = [
		'async-load-calypso-blocks-privacy-prefs.abc.min.js',
		'entry-main.abc.min.js',
	].map( ( name ) => ( { name, url: PUBLIC_PATH + name, type: 'script' } ) );

	test( 'passes when the control is blocked and no asset is', () => {
		const report = audit( {
			lists: [ makeList( 'cookie', [ '-cookie-banner.' ] ) ],
			assets,
			config,
			pageUrl: PAGE_URL,
			publicPath: PUBLIC_PATH,
		} );
		expect( report.controlsPassed ).toBe( true );
		expect( report.blocked ).toEqual( [] );
		expect( report.assetsScanned ).toBe( 2 );
	} );

	test( 'fails the control when the lists no longer block the known-bad name', () => {
		const report = audit( {
			lists: [ makeList( 'cookie', [ '/cookie-consent.' ] ) ],
			assets,
			config,
			pageUrl: PAGE_URL,
			publicPath: PUBLIC_PATH,
		} );
		expect( report.controlsPassed ).toBe( false );
		expect( report.controls.every( ( control ) => ! control.blocked ) ).toBe( true );
	} );

	test( 'reports blocked assets with the matching rule and list', () => {
		const report = audit( {
			lists: [ makeList( 'cookie', [ '-cookie-banner.', '-privacy-prefs.' ] ) ],
			assets,
			config,
			pageUrl: PAGE_URL,
			publicPath: PUBLIC_PATH,
		} );
		expect( report.blocked ).toEqual( [
			expect.objectContaining( {
				name: 'async-load-calypso-blocks-privacy-prefs.abc.min.js',
				blockedBy: [ { list: 'cookie', line: 2, rule: '-privacy-prefs.' } ],
			} ),
		] );
	} );

	test( 'reports matches that an exception allows separately', () => {
		const report = audit( {
			lists: [
				makeList( 'cookie', [ '-cookie-banner.', 'entry-main.' ] ),
				makeList( 'allow', [ '@@||wordpress.com/calypso/evergreen/entry-' ] ),
			],
			assets,
			config,
			pageUrl: PAGE_URL,
			publicPath: PUBLIC_PATH,
		} );
		expect( report.blocked ).toEqual( [] );
		expect( report.allowedByException.map( ( asset ) => asset.name ) ).toEqual( [
			'entry-main.abc.min.js',
		] );
	} );
} );

describe( 'fetching', () => {
	const realFetch = global.fetch;
	const respond = ( status, body = '' ) => ( {
		ok: status >= 200 && status < 300,
		status,
		text: async () => body,
	} );

	afterEach( () => {
		global.fetch = realFetch;
		jest.restoreAllMocks();
	} );

	test( 'retries server errors and network failures', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce( respond( 503 ) )
			.mockRejectedValueOnce( new Error( 'socket hang up' ) )
			.mockResolvedValueOnce( respond( 200, 'ok' ) );
		await expect( fetchWithRetry( 'https://example.com/', { delayMs: 0 } ) ).resolves.toBe( 'ok' );
		expect( global.fetch ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'does not retry client errors', async () => {
		global.fetch = jest.fn().mockResolvedValue( respond( 404 ) );
		await expect( fetchWithRetry( 'https://example.com/', { delayMs: 0 } ) ).rejects.toThrow(
			'HTTP 404'
		);
		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'falls back to the cached list when a refresh fails', async () => {
		const cacheDir = fs.mkdtempSync( path.join( os.tmpdir(), 'content-blocker-lists-' ) );
		try {
			fs.writeFileSync( path.join( cacheDir, 'cookie.txt' ), '-cookie-banner.' );
			global.fetch = jest.fn().mockResolvedValue( respond( 502 ) );
			jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const lists = await loadFilterLists(
				{ lists: [ { id: 'cookie', url: 'https://example.com/cookie.txt' } ] },
				{ cacheDir, refresh: true, fetchOptions: { delayMs: 0 } }
			);
			expect( lists ).toEqual( [
				expect.objectContaining( { id: 'cookie', text: '-cookie-banner.', stale: true } ),
			] );

			await expect(
				loadFilterLists(
					{ lists: [ { id: 'missing', url: 'https://example.com/missing.txt' } ] },
					{ cacheDir, refresh: true, fetchOptions: { delayMs: 0 } }
				)
			).rejects.toThrow( 'Could not download "missing"' );
		} finally {
			fs.rmSync( cacheDir, { recursive: true, force: true } );
		}
	} );
} );
