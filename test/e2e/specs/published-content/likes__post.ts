/**
 * @group gutenberg
 * @group calypso-pr
 * @group calypso-release
 */

import {
	DataHelper,
	ElementHelper,
	PublishedPostPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser, Frame } from 'playwright';

declare const browser: Browser;

// Temporary instrumentation for the flaky "Like post" step. Remove with the
// probe in the test body once the Like-widget render failure is understood.
type LikeProbeData = {
	console: { type: string; text: string }[];
	pageErrors: string[];
	responses: { url: string; status: number; frame: string }[];
	requestFailures: {
		url: string;
		failure: string | null;
		frame: string;
		method: string;
		resourceType: string;
		origin: string | undefined;
		hasCookie: boolean;
	}[];
	// Low-level network failures from CDP, including the cross-origin rest-proxy
	// iframe (an OOPIF), which page-level events report only as net::ERR_FAILED.
	// Carries blockedReason / corsErrorStatus that name the real transport block.
	cdp: Record< string, unknown >[];
};

/**
 * Dumps the state of the Like widget when `likePost()` fails, so a CI build log
 * shows whether the iframe is missing, empty, or errored, and what the
 * widgets.wp.com requests returned. Output is a single `[LIKE_PROBE]` line.
 */
async function logLikeWidgetProbe( page: Page, probe: LikeProbeData ): Promise< void > {
	let dom: unknown;
	try {
		dom = await page.evaluate( () => {
			const trunc = ( html: string | null | undefined ) => ( html ? html.slice( 0, 1200 ) : null );
			const iframe = document.querySelector(
				'iframe[title="Like or Reblog"]'
			) as HTMLIFrameElement | null;
			const container =
				document.querySelector( '.jetpack-likes-widget-wrapper' ) ||
				document.querySelector( '[id^="like-post-wrapper"]' ) ||
				document.querySelector( '.sharedaddy' );
			return {
				hasLikeContainer: !! container,
				likeContainerHTML: trunc( ( container as HTMLElement | null )?.outerHTML ),
				iframe: iframe
					? {
							src: iframe.getAttribute( 'src' ),
							width: iframe.clientWidth,
							height: iframe.clientHeight,
					  }
					: null,
			};
		} );
	} catch ( e ) {
		dom = { evaluateError: String( e ).slice( 0, 200 ) };
	}

	const frames: { url: string; name: string; bodyText: string }[] = [];
	for ( const f of page.frames() ) {
		let bodyText = '';
		try {
			bodyText = ( await f.locator( 'body' ).innerText( { timeout: 1000 } ) ).slice( 0, 200 );
		} catch {
			// Frame may be empty, cross-origin-blocked, or detached; skip its text.
		}
		frames.push( { url: f.url(), name: f.name(), bodyText } );
	}

	// eslint-disable-next-line no-console
	console.log(
		'[LIKE_PROBE] ' +
			JSON.stringify( {
				url: page.url(),
				dom,
				frames,
				console: probe.console.slice( -20 ),
				pageErrors: probe.pageErrors.slice( -20 ),
				responses: probe.responses.slice( -40 ),
				requestFailures: probe.requestFailures.slice( -40 ),
				cdp: probe.cdp.slice( -40 ),
			} )
	);
}

describe( 'Likes: Post', function () {
	const features = envToFeatureKey( envVariables );
	// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
	// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
	const accountName = getTestAccountByFeature( features, [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	const postingUser = new TestAccount( accountName );
	const otherUser = new TestAccount( 'defaultUser' );
	let page: Page;
	let restAPIClient: RestAPIClient;
	let otherUserRestAPIClient: RestAPIClient;

	let newPost: PostResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await postingUser.authenticate( page );
	} );

	it( 'Setup the test', async function () {
		restAPIClient = new RestAPIClient( postingUser.credentials );
		otherUserRestAPIClient = new RestAPIClient( otherUser.credentials );
		const siteID = postingUser.credentials.testSites?.primary.id as number;

		newPost = await restAPIClient.createPost( siteID, {
			title: DataHelper.getRandomPhrase(),
		} );

		// Ensure neither user has a stale "liked" state on the post
		// from a previous test run.
		await Promise.allSettled( [
			restAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
			otherUserRestAPIClient.postLikeAction( 'unlike', siteID, newPost.ID ),
		] );
	} );

	describe( 'While authenticated', function () {
		let publishedPostPage: PublishedPostPage;

		it( 'View post', async function () {
			await ElementHelper.reloadAndRetry( page, async () => {
				await page.goto( newPost.URL, { timeout: 20 * 1000 } );
			} );
		} );

		it( 'Like post', async function () {
			const siteID = postingUser.credentials.testSites?.primary.id as number;

			// Temporary diagnostics: the Like button (loaded in an iframe from
			// widgets.wp.com) intermittently fails to render on Atomic, leaving the
			// "Like this:" section empty and the test timing out. Collect
			// network/console/DOM/frame state on failure so a CI run shows why.
			// Remove once the cause is identified.
			const probe: LikeProbeData = {
				console: [],
				pageErrors: [],
				responses: [],
				requestFailures: [],
				cdp: [],
			};
			const widgetUrl = /widgets\.wp\.com|\/likes|like\.php|\/rest\/v1\/batch/i;
			const frameUrl = ( r: { frame: () => Frame } ) => {
				try {
					return r.frame().url();
				} catch {
					return '(detached)';
				}
			};
			page.on( 'console', ( msg ) => {
				if ( msg.type() === 'error' || msg.type() === 'warning' ) {
					probe.console.push( { type: msg.type(), text: msg.text().slice( 0, 300 ) } );
				}
			} );
			page.on( 'pageerror', ( err ) => probe.pageErrors.push( String( err ).slice( 0, 300 ) ) );
			page.on( 'response', ( res ) => {
				if ( widgetUrl.test( res.url() ) ) {
					probe.responses.push( {
						url: res.url(),
						status: res.status(),
						frame: frameUrl( res.request() ),
					} );
				}
			} );
			page.on( 'requestfailed', ( req ) => {
				if ( widgetUrl.test( req.url() ) ) {
					const headers = req.headers();
					probe.requestFailures.push( {
						url: req.url(),
						failure: req.failure()?.errorText ?? null,
						frame: frameUrl( req ),
						method: req.method(),
						resourceType: req.resourceType(),
						origin: headers.origin,
						hasCookie: Boolean( headers.cookie ),
					} );
				}
			} );

			// Attach a CDP Network probe per frame to recover the transport-level
			// block reason behind net::ERR_FAILED. Needed because the authenticated
			// batch travels through the cross-origin public-api.wordpress.com proxy
			// iframe, an OOPIF whose network events page-level listeners do not see.
			// Fully guarded: any CDP failure is swallowed and never affects the test.
			// ponytail: first-request-per-frame may race the attach; reloadAndRetry
			// reloads several times, so a later attempt catches it.
			const cdpReqUrl = new Map< string, string >();
			const attachNetworkProbe = async ( target: Page | Frame ) => {
				try {
					const cdp = await page.context().newCDPSession( target );
					await cdp.send( 'Network.enable' );
					cdp.on(
						'Network.requestWillBeSent',
						( e: { requestId: string; request: { url: string } } ) => {
							if ( widgetUrl.test( e.request.url ) ) {
								cdpReqUrl.set( e.requestId, e.request.url );
							}
						}
					);
					cdp.on(
						'Network.loadingFailed',
						( e: {
							requestId: string;
							type?: string;
							errorText?: string;
							blockedReason?: string;
							corsErrorStatus?: { corsError?: string };
						} ) => {
							const url = cdpReqUrl.get( e.requestId );
							if ( ! url ) {
								return;
							}
							probe.cdp.push( {
								event: 'loadingFailed',
								url,
								type: e.type,
								errorText: e.errorText,
								blockedReason: e.blockedReason,
								corsError: e.corsErrorStatus?.corsError,
							} );
						}
					);
					cdp.on(
						'Network.responseReceivedExtraInfo',
						( e: { requestId: string; blockedCookies?: unknown[] } ) => {
							const url = cdpReqUrl.get( e.requestId );
							if ( url && e.blockedCookies?.length ) {
								probe.cdp.push( {
									event: 'blockedCookies',
									url,
									blockedCookies: e.blockedCookies,
								} );
							}
						}
					);
				} catch {
					// Non-Chromium, or frame detached/cross-process at attach time; skip.
				}
			};
			await attachNetworkProbe( page );
			page.on( 'frameattached', ( frame ) => void attachNetworkProbe( frame ) );
			await Promise.all(
				page
					.frames()
					.filter( ( frame ) => frame !== page.mainFrame() )
					.map( ( frame ) => attachNetworkProbe( frame ) )
			);

			// Log the probe only when the whole step fails (all retries exhausted),
			// not on individual attempts that reloadAndRetry recovers from, so
			// green runs stay clean.
			try {
				await ElementHelper.reloadAndRetry( page, async () => {
					// Reset like state via REST API before each attempt.
					await restAPIClient.postLikeAction( 'unlike', siteID, newPost.ID );
					await page.reload();
					publishedPostPage = new PublishedPostPage( page );
					await publishedPostPage.likePost();
				} );
			} catch ( error ) {
				await logLikeWidgetProbe( page, probe );
				throw error;
			}
		} );

		it( 'Unlike post', async function () {
			await ElementHelper.reloadAndRetry( page, async () => {
				publishedPostPage = new PublishedPostPage( page );
				await publishedPostPage.unlikePost();
			} );
		} );
	} );

	describe( 'While unauthenticated', function () {
		let newPage: Page;
		let publishedPostPage: PublishedPostPage;

		beforeAll( async () => {
			newPage = await browser.newPage();
		} );

		it( 'Go to the published post page', async () => {
			await ElementHelper.reloadAndRetry( newPage, async () => {
				await newPage.goto( newPost.URL, { timeout: 20 * 1000 } );
			} );
		} );

		it( 'Login via popup to like the post', async function () {
			newPage.on( 'popup', async ( popup ) => {
				await otherUser.logInViaPopupPage( popup );
			} );

			publishedPostPage = new PublishedPostPage( newPage );
			await publishedPostPage.likePost();
		} );
	} );

	afterAll( async function () {
		if ( ! newPost ) {
			return;
		}

		await restAPIClient.deletePost(
			postingUser.credentials.testSites?.primary.id as number,
			newPost.ID
		);
	} );
} );
