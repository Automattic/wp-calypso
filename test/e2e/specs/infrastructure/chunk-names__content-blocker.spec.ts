import { DataHelper } from '@automattic/calypso-e2e';
import { Request } from '@ghostery/adblocker-playwright';
import { collectChunkAssets, type ChunkAsset } from '../../lib/chunk-assets';
import { loadContentBlocker, type ContentBlocker } from '../../lib/content-blocker';
import { expect, tags, test } from '../../lib/pw-base';
import type { APIRequestContext } from '@playwright/test';

/**
 * One page per webpack entry point. All entries share one runtime, so the chunk
 * maps are the same on every page; each page only adds its own `entry-*` files.
 * All four answer logged out.
 */
const pageUrls = () => [
	DataHelper.getCalypsoURL( 'setup/onboarding/user' ), // entry-stepper
	DataHelper.getCalypsoURL( 'log-in' ), // entry-login
	DataHelper.getCalypsoURL( 'themes' ), // entry-main
	DataHelper.getDashboardURL( 'sites' ), // entry-dashboard-dotcom
];

/**
 * The chunk name that blanked logged-out onboarding before #112944 renamed it,
 * matched by the `-cookie-banner.` rule in EasyList Cookie. Checked under the real
 * public path, as a script and as a stylesheet: if the lists no longer block it, a
 * clean result would mean nothing.
 */
const CONTROL_CHUNK = 'async-load-calypso-blocks-cookie-banner.0123456789abcdef0123.min';

interface Verdict extends ChunkAsset {
	pageUrl: string;
	blocked: boolean;
	rule: string | undefined;
	exception: string | undefined;
}

function check(
	blocker: ContentBlocker[ 'blocker' ],
	asset: ChunkAsset,
	pageUrl: string
): Verdict {
	const result = blocker.match(
		Request.fromRawDetails( { url: asset.url, type: asset.type, sourceUrl: pageUrl } )
	);
	return {
		...asset,
		pageUrl,
		blocked: result.match,
		rule: result.filter?.rawLine ?? result.filter?.toString(),
		exception: result.exception?.rawLine ?? result.exception?.toString(),
	};
}

/**
 * Fetches a page, retrying a 429 or 5xx so a brief throttle on the server under test
 * does not fail the audit.
 */
async function fetchPage( request: APIRequestContext, url: string ): Promise< string > {
	for ( let attempt = 1; ; attempt++ ) {
		const response = await request.get( url, { timeout: 20_000 } );
		if ( response.ok() ) {
			return response.text();
		}
		const retry = response.status() === 429 || response.status() >= 500;
		if ( ! retry || attempt === 3 ) {
			throw new Error( `${ url } responded ${ response.status() }` );
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 5_000 * attempt ) );
	}
}

/**
 * Content blockers match request URLs against filter lists, and some rules are
 * generic enough to hit a chunk name. This audit runs every script and stylesheet
 * URL the build under test can load through the lists common blockers ship with,
 * so a chunk name they would refuse is caught before it is deployed. It needs no
 * browser: the URLs come from the webpack runtime inlined in each page.
 */
test.describe(
	DataHelper.createSuiteTitle( 'Chunk names: Not matched by common content-blocker lists' ),
	{ tag: [ tags.CALYPSO_PR, tags.DESKTOP_ONLY ] },
	() => {
		test( 'As a visitor with a content blocker, every Calypso script and stylesheet can load', async ( {
			request,
		}, testInfo ) => {
			// The filter lists take about ten seconds to download and parse.
			test.setTimeout( 120_000 );

			let contentBlocker: ContentBlocker;
			const pages: { pageUrl: string; publicPath: string; verdicts: Verdict[] }[] = [];

			await test.step( 'Given the filter lists Brave and uBlock Origin ship with', async function () {
				try {
					// `debug` keeps each filter's raw line, so a match can name its rule.
					contentBlocker = await loadContentBlocker( request, { debug: true } );
				} catch ( error ) {
					// The lists come from third-party hosts. An unreachable host must not fail an
					// unrelated PR; the scheduled production check runs this audit's lists again.
					// eslint-disable-next-line playwright/no-skipped-test
					test.skip( true, `Could not download the filter lists: ${ ( error as Error ).message }` );
				}
				await testInfo.attach( 'filter-lists.txt', { body: contentBlocker.versions.join( '\n' ) } );
			} );

			await test.step( 'When I collect every chunk URL the build can load', async function () {
				const htmlByPage = await Promise.all(
					pageUrls().map( async ( pageUrl ) => ( {
						pageUrl,
						html: await fetchPage( request, pageUrl ),
					} ) )
				);
				for ( const { pageUrl, html } of htmlByPage ) {
					const { publicPath, assets } = collectChunkAssets( html, pageUrl );
					expect( assets.length, `${ pageUrl } lists chunk URLs` ).toBeGreaterThan( 0 );
					pages.push( {
						pageUrl,
						publicPath,
						verdicts: assets.map( ( asset ) => check( contentBlocker.blocker, asset, pageUrl ) ),
					} );
				}
			} );

			await test.step( 'Then the lists still block the chunk name that broke onboarding', async function () {
				const [ { pageUrl, publicPath } ] = pages;
				const controls = ( [ 'js', 'css' ] as const ).map( ( extension ) =>
					check(
						contentBlocker.blocker,
						{
							name: `${ CONTROL_CHUNK }.${ extension }`,
							url: `${ publicPath }${ CONTROL_CHUNK }.${ extension }`,
							type: extension === 'js' ? 'script' : 'stylesheet',
						},
						pageUrl
					)
				);
				expect(
					controls.map(
						( control ) => `${ control.name }: ${ control.blocked ? 'blocked' : 'NOT blocked' }`
					)
				).toEqual( controls.map( ( control ) => `${ control.name }: blocked` ) );
			} );

			await test.step( 'And no Calypso script or stylesheet matches a list', async function () {
				// The chunk maps are the same on every page, so report each file once.
				const verdicts = [
					...new Map(
						pages
							.flatMap( ( page ) => page.verdicts )
							.map( ( verdict ) => [ verdict.url, verdict ] )
					).values(),
				];
				const blocked = verdicts.filter( ( verdict ) => verdict.blocked );
				const allowedByException = verdicts.filter(
					( verdict ) => ! verdict.blocked && verdict.exception
				);
				const describe = ( verdict: Verdict ) =>
					`${ verdict.name }\n    ${ verdict.rule ?? '(unknown rule)' }${
						verdict.exception ? `\n    allowed by ${ verdict.exception }` : ''
					}`;
				await testInfo.attach( 'chunk-audit.txt', {
					body: [
						...pages.map( ( page ) => `${ page.pageUrl }: ${ page.verdicts.length } assets` ),
						'',
						`Blocked (${ blocked.length }):`,
						...blocked.map( describe ),
						'',
						`Matched but allowed by an exception (${ allowedByException.length }):`,
						...allowedByException.map( describe ),
					].join( '\n' ),
				} );
				expect( blocked.map( describe ) ).toEqual( [] );
			} );
		} );

		test( 'The chunk URLs are read out of the webpack runtime', async () => {
			const pageUrl = 'https://wordpress.com/setup/onboarding/user';
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
			const expected = [
				'script 80.h80.min.js',
				'stylesheet async-load-calypso-blocks-privacy-prefs.c60977.min.css',
				'stylesheet async-load-calypso-blocks-privacy-prefs.c60977.min.rtl.css',
				'script async-load-calypso-blocks-privacy-prefs.h60977.min.js',
				'stylesheet entry-stepper.c1.min.css',
				'script entry-stepper.e1.min.js',
				'script onboarding-unified-flow.h90.min.js',
			];
			const names = ( assets: ChunkAsset[] ) =>
				assets.map( ( { name, type } ) => `${ type } ${ name }` );

			await test.step( 'Chunks come from the maps, page assets from the tags, other hosts are left out', async function () {
				const { publicPath, assets } = collectChunkAssets( html, pageUrl );
				expect( publicPath ).toBe( 'https://wordpress.com/calypso/evergreen/' );
				expect( names( assets ) ).toEqual( expected );
			} );

			await test.step( 'The minified runtime production serves is read the same way', async function () {
				const minified = html.replaceAll( '""+', '' );
				expect( minified ).not.toBe( html );
				expect( names( collectChunkAssets( minified, pageUrl ).assets ) ).toEqual( expected );
			} );

			await test.step( 'A runtime that cannot be parsed fails instead of auditing nothing', async function () {
				expect( () => collectChunkAssets( '<html></html>', pageUrl ) ).toThrow(
					'Could not find the webpack public path'
				);
				expect( () =>
					collectChunkAssets( '<script src="/__challenge/probes.js"></script>', pageUrl )
				).toThrow( 'bot challenge' );
				const withoutCss = html.replace( /c\.miniCssF=[^\n]*/, 'c.miniCssF=a=>unexpected(a);' );
				expect( () => collectChunkAssets( withoutCss, pageUrl ) ).toThrow( 'missing: stylesheet' );
			} );
		} );
	}
);
