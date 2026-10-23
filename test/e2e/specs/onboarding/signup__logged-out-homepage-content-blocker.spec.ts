import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { DataHelper, LoggedOutHomePage } from '@automattic/calypso-e2e';
import { FiltersEngine, Request, fromPlaywrightDetails } from '@ghostery/adblocker-playwright';
import { expect, tags, test } from '../../lib/pw-base';
import { swapBaseUrl } from '../shared';

/**
 * The lists uBlock Origin, AdGuard and Brave enable by default or offer one click
 * away. EasyList Cookie is the one that blocked the cookie banner chunk and
 * blanked logged-out onboarding (DOTOBRD-569).
 */
const FILTER_LISTS = [
	'https://easylist.to/easylist/easylist.txt',
	'https://easylist.to/easylist/easyprivacy.txt',
	'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
	'https://secure.fanboy.co.nz/fanboy-annoyance.txt',
	'https://ublockorigin.github.io/uAssets/filters/filters.txt',
	'https://ublockorigin.github.io/uAssets/filters/privacy.txt',
	'https://filters.adtidy.org/extension/ublock/filters/2_without_easylist.txt',
	'https://filters.adtidy.org/extension/ublock/filters/3.txt',
	'https://filters.adtidy.org/extension/ublock/filters/14.txt',
];

/**
 * A cookie-banner script on a neutral domain, matched by the same kind of EasyList
 * Cookie rule that blocked Calypso's chunk. If the lists stop blocking it, the
 * check below would pass for the wrong reason.
 */
const KNOWN_BLOCKED_URL = 'https://example.com/cookie-banner.js';

const CALYPSO_SCRIPT_OR_STYLESHEET = /\/calypso\/[^?#]*\.(?:js|css)(?:[?#]|$)/;

const ONBOARDING_PATH = /\/setup\/onboarding(?:[/?#]|$)/;

const CALYPSO_STACK_FRAME = /\/calypso\/[^\s)]*\.js/;

/**
 * `@automattic/load-script` rejects with this when a script fails to load. For a script
 * the lists blocked, such as Tracks, that is the blocker working, not Calypso breaking.
 */
const FAILED_SCRIPT_LOAD = /^Failed to load script "([^"]+)"/;

function isBlockedScriptLoad( error: string, blockedUrls: string[], pageUrl: string ): boolean {
	const src = FAILED_SCRIPT_LOAD.exec( error )?.[ 1 ];
	return !! src && blockedUrls.includes( new URL( src, pageUrl ).href );
}

/**
 * Where the TeamCity build reads the run summary from. Its first line, the Calypso commit,
 * goes in the failure alert; the filter list versions after it go in the build log.
 */
const RUN_SUMMARY_PATH = path.resolve(
	__dirname,
	'..',
	'..',
	'output',
	'content-blocker-run-summary.txt'
);

/**
 * Each list's title and version, by URL, from the header of the copy this run used.
 */
const listVersions = new Map< string, string >();

function describeList( url: string, text: string ): string {
	const header = text.slice( 0, 2_000 );
	const field = ( name: string ) =>
		new RegExp( `^! ${ name }: (.+)$`, 'm' ).exec( header )?.[ 1 ].trim();
	const version = field( 'Version' ) ?? field( 'TimeUpdated' ) ?? field( 'Last modified' );
	return `${ field( 'Title' ) ?? url } ${ version ?? '(unversioned)' }`;
}

/**
 * Fails on error responses, which `fromLists` would otherwise parse as filters, and
 * on stalled connections, including while reading the body. `fromLists` retries a
 * rejected fetch.
 */
async function fetchList( url: string ): Promise< Response > {
	const response = await fetch( url, { signal: AbortSignal.timeout( 20_000 ) } );
	if ( ! response.ok ) {
		throw new Error( `${ url } responded ${ response.status }` );
	}
	const text = await response.text();
	listVersions.set( url, describeList( url, text ) );
	return new Response( text );
}

/**
 * The Calypso commit the server under test is running, from the `COMMIT_SHA` global
 * every Calypso page sets. Tried twice, since a single stalled request would leave the
 * alert without it.
 */
async function fetchServedCommit( baseUrl: string ): Promise< string > {
	for ( let attempt = 1; attempt <= 2; attempt++ ) {
		try {
			const response = await fetch( new URL( '/setup/onboarding/user', baseUrl ), {
				signal: AbortSignal.timeout( 20_000 ),
			} );
			const sha = /var COMMIT_SHA = "([0-9a-f]+)"/.exec( await response.text() )?.[ 1 ];
			if ( sha ) {
				return sha.slice( 0, 11 );
			}
		} catch {}
	}
	return '(unknown)';
}

/**
 * A visitor whose browser runs a content blocker must still get a usable signup
 * step from the homepage's primary call to action. Blocked chunks must not blank
 * the page, and no Calypso script or stylesheet may match the lists at all.
 */
test.describe(
	DataHelper.createSuiteTitle( 'Signup: Logged-out homepage with a content blocker' ),
	{ tag: [ tags.CONTENT_BLOCKER ] },
	() => {
		test( 'As a logged-out visitor with a content blocker, I can reach a usable signup step from the homepage', async ( {
			page,
			environment,
		}, testInfo ) => {
			const loggedOutHomePage = new LoggedOutHomePage( page );
			const blockedUrls: string[] = [];
			const pageErrors: string[] = [];

			await test.step( 'Given my browser blocks requests the way Brave and uBlock Origin do', async function () {
				const [ blocker, servedCommit ] = await Promise.all( [
					FiltersEngine.fromLists( fetchList, FILTER_LISTS ),
					fetchServedCommit( environment.CALYPSO_BASE_URL ),
				] );

				const summary = [
					`Calypso ${ servedCommit }`,
					...FILTER_LISTS.map( ( url ) => listVersions.get( url ) ),
				].join( '\n' );
				await testInfo.attach( 'run-summary.txt', { body: summary } );
				await mkdir( path.dirname( RUN_SUMMARY_PATH ), { recursive: true } );
				await writeFile( RUN_SUMMARY_PATH, summary );

				const control = Request.fromRawDetails( {
					url: KNOWN_BLOCKED_URL,
					type: 'script',
					sourceUrl: environment.CALYPSO_BASE_URL,
				} );
				expect( blocker.match( control ).match, 'the lists block the known-blocked chunk' ).toBe(
					true
				);

				// Routed by hand rather than through PlaywrightBlocker so blocked requests are
				// recorded and allowed ones fall back to the routes the page fixture registered.
				await page.route( '**/*', async ( route ) => {
					const request = route.request();
					if ( ! blocker.match( fromPlaywrightDetails( request ) ).match ) {
						await route.fallback();
						return;
					}
					blockedUrls.push( request.url() );
					await route.abort( 'blockedbyclient' );
				} );
			} );

			await test.step( 'And I have never answered the cookie banner', async function () {
				// The page fixture pre-accepts the banner; a first-time visitor has not.
				await page.context().clearCookies( { name: 'sensitive_pixel_options' } );
			} );

			await test.step( 'When I visit the logged-out homepage', async function () {
				await loggedOutHomePage.visit();
			} );

			await test.step( 'And I click the Get started button', async function () {
				// Errors on the marketing homepage are not this check's concern; the user step's are.
				page.on( 'pageerror', ( error ) => {
					if ( ONBOARDING_PATH.test( page.url() ) ) {
						pageErrors.push( `${ error.message }\n${ error.stack ?? '' }` );
					}
				} );

				const getStartedUrl = new URL( await loggedOutHomePage.getStartedHref(), page.url() ).href;
				if (
					new URL( environment.CALYPSO_BASE_URL ).origin ===
					new URL( environment.WPCOM_BASE_URL ).origin
				) {
					await loggedOutHomePage.getStartedLink.click();
					return;
				}

				// The homepage links to production, so open the user step on the build under test.
				const userStepUrl = new URL( swapBaseUrl( getStartedUrl, environment.CALYPSO_BASE_URL ) );
				// The cookie banner flag is on in production only.
				userStepUrl.searchParams.set( 'flags', 'cookie-banner' );
				await page.goto( userStepUrl.href, { waitUntil: 'domcontentloaded' } );
			} );

			await test.step( 'Then I land on the onboarding user step', async function () {
				await page.waitForURL( /\/setup\/onboarding\/user/, { timeout: 30_000 } );
			} );

			const emailInput = page.locator( 'input[name="email"]' );
			// Some layouts and experiment variants hide the email field behind this button.
			const continueWithEmailButton = page.getByRole( 'button', { name: 'Continue with email' } );

			await test.step( 'And the signup options are shown', async function () {
				// Same budget UserSignupPage gives the signup form to hydrate.
				await expect(
					continueWithEmailButton.or( emailInput ).filter( { visible: true } ).first()
				).toBeVisible( {
					timeout: 30_000,
				} );
			} );

			await test.step( 'And I can enter my email address', async function () {
				if ( await continueWithEmailButton.isVisible() ) {
					await continueWithEmailButton.click();
				}
				await emailInput.fill( 'content-blocker@example.com' );
				await expect( emailInput ).toHaveValue( 'content-blocker@example.com' );
			} );

			await test.step( 'And the content blocker was blocking requests', async function () {
				await testInfo.attach( 'blocked-requests.txt', { body: blockedUrls.join( '\n' ) } );
				expect( blockedUrls.length ).toBeGreaterThan( 0 );
			} );

			await test.step( 'And no Calypso script or stylesheet was blocked', async function () {
				expect( blockedUrls.filter( ( url ) => CALYPSO_SCRIPT_OR_STYLESHEET.test( url ) ) ).toEqual(
					[]
				);
			} );

			await test.step( 'And Calypso raised no uncaught errors on the user step', async function () {
				await testInfo.attach( 'page-errors.txt', { body: pageErrors.join( '\n\n' ) } );
				// Third-party scripts throw on production for reasons unrelated to blocking.
				expect(
					pageErrors.filter(
						( error ) =>
							CALYPSO_STACK_FRAME.test( error ) &&
							! isBlockedScriptLoad( error, blockedUrls, page.url() )
					)
				).toEqual( [] );
			} );
		} );
	}
);
