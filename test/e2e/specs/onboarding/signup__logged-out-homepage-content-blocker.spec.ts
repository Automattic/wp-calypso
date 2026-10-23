import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import {
	DataHelper,
	LoggedOutHomePage,
	NewSiteResponse,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { FiltersEngine, Request, fromPlaywrightDetails } from '@ghostery/adblocker-playwright';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount, apiDeleteSite, swapBaseUrl } from '../shared';

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

const SIGNUP_JOURNEY_PATH = /\/(?:setup\/onboarding|checkout)(?:[/?#]|$)/;

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
 * A visitor whose browser runs a content blocker must still be able to go from the
 * homepage's primary call to action through signup to a checkout they can pay at.
 * Blocked chunks must not blank a step, and no Calypso script or stylesheet may match
 * the lists at all.
 */
test.describe(
	DataHelper.createSuiteTitle( 'Signup: Logged-out homepage with a content blocker' ),
	{ tag: [ tags.CONTENT_BLOCKER ] },
	() => {
		const planName = 'Personal';
		const testUser = DataHelper.getNewTestUser();
		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse | undefined;

		test.afterAll( 'Close the account the test created', async function () {
			if ( ! newUserDetails ) {
				return;
			}
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);
			if ( newSiteDetails ) {
				await apiDeleteSite( restAPIClient, {
					url: newSiteDetails.blog_details.url,
					id: newSiteDetails.blog_details.blogid,
					name: newSiteDetails.blog_details.blogname,
				} );
			}
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a logged-out visitor with a content blocker, I can sign up from the homepage and reach checkout', async ( {
			page,
			environment,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		}, testInfo ) => {
			// The filter lists take about ten seconds to download and parse.
			test.setTimeout( 180_000 );

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
				// Like PlaywrightBlocker, never block the top-level document: no content blocker
				// aborts a navigation, and a `$document` rule would read as a signup outage.
				await page.route( '**/*', async ( route ) => {
					const request = route.request();
					const frame = request.frame();
					const details = fromPlaywrightDetails( request );
					const isTopLevelDocument =
						details.isMainFrame() ||
						( details.type === 'document' && frame.parentFrame() === null );
					if ( isTopLevelDocument || ! blocker.match( details ).match ) {
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
				// Errors on the marketing homepage are not this check's concern; the signup journey's are.
				page.on( 'pageerror', ( error ) => {
					if ( SIGNUP_JOURNEY_PATH.test( page.url() ) ) {
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

			await test.step( 'When I sign up with my email address', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I skip choosing a domain', async function () {
				await componentDomainSearch.search( helperData.getBlogName() );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I can enter my card details', async function () {
				// Fills the card form, Stripe's fields included, without paying.
				await pageCartCheckout.enterPaymentDetails( helperData.getTestPaymentDetails() );
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

			await test.step( 'And Calypso raised no uncaught errors during signup', async function () {
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
