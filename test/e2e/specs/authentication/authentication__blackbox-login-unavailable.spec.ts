import { expect, tags, test } from '../../lib/pw-base';
import type { LoginPage } from '@automattic/calypso-e2e';
import type { Page } from 'playwright';

/**
 * Blackbox must never block login. Both tests here take a surface away from the
 * SDK and assert the login still completes, with `blackbox_session_id` omitted
 * from the request rather than sent empty.
 *
 * The submit button starts disabled while Blackbox loads and is released by the
 * fail-open timeout in `useBlackbox()`, so the waits below budget past it.
 */
const BLACKBOX_FAIL_OPEN_BUDGET_MS = 30 * 1000;

/**
 * Submits the password step and asserts the request carried no Blackbox session
 * id and was accepted.
 */
async function expectPasswordLoginSucceedsWithoutSessionId(
	page: Page,
	pageLogin: LoginPage,
	username: string,
	password: string
): Promise< void > {
	await pageLogin.fillUsername( username );
	await pageLogin.clickSubmit();
	await pageLogin.fillPassword( password );

	await expect( page.locator( 'button[type="submit"]' ) ).toBeEnabled( {
		timeout: BLACKBOX_FAIL_OPEN_BUDGET_MS,
	} );

	const loginResponse = page.waitForResponse(
		( response ) =>
			response.request().method() === 'POST' && response.url().includes( 'action=login-endpoint' )
	);
	const loginRequest = page.waitForRequest(
		( request ) => request.method() === 'POST' && request.url().includes( 'action=login-endpoint' )
	);

	await pageLogin.clickSubmit();
	const request = await loginRequest;
	const response = await loginResponse;
	const body = await response.json();
	const postData = new URLSearchParams( request.postData() ?? '' );

	expect( postData.get( 'blackbox_session_id' ) ).toBeNull();
	expect( response.status() ).toBe( 200 );
	expect( body?.success ).toBe( true );
}

test.describe(
	'Authentication: Blackbox login when the SDK is unavailable',
	{ tag: [ tags.AUTHENTICATION ] },
	() => {
		test( 'As a WordPress.com user, I can log in when Blackbox is unreachable', async ( {
			page,
			pageLogin,
			secrets,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one that has the right browser settings for authentication tests'
			);

			const credentials = secrets.testAccounts.defaultUser;

			await test.step( 'Given every Blackbox request fails', async function () {
				await page.route( '**/blackbox-api.wp.com/**', ( route ) => route.abort() );
			} );

			await test.step( 'When I visit the login page', async function () {
				await pageLogin.visit();
				await page.waitForURL( /log-in/ );
			} );

			await test.step( 'And I submit valid credentials', async function () {
				await expectPasswordLoginSucceedsWithoutSessionId(
					page,
					pageLogin,
					credentials.username as string,
					credentials.password
				);
			} );

			await test.step( 'Then I leave the login page', async function () {
				// The redirect only fires once remoteLoginUser has settled its token-link
				// iframes, which it allows 25s each, and is then a full page load. Budget
				// past that and wait for the URL to change rather than for it to load.
				await page.waitForURL( ( url ) => ! url.pathname.includes( '/log-in' ), {
					waitUntil: 'commit',
					timeout: 60 * 1000,
				} );
			} );
		} );

		test( 'As a WordPress.com user, I can log in when a Blackbox collect never settles', async ( {
			page,
			pageLogin,
			secrets,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one that has the right browser settings for authentication tests'
			);

			const credentials = secrets.testAccounts.defaultUser;

			await test.step( 'Given collect() hangs instead of resolving', async function () {
				// The SDK is kept off the page so the stub below survives, standing in
				// for a load that succeeds and then stalls mid-collect. getSessionId()
				// races collect() against its own timeout and gives up on it.
				await page.route( '**/blackbox-api.wp.com/**', ( route ) => route.abort() );
				await page.addInitScript( () => {
					( window as unknown as { Blackbox: unknown } ).Blackbox = {
						configure: () => undefined,
						collect: () => new Promise( () => undefined ),
						reset: () => undefined,
					};
				} );
			} );

			await test.step( 'When I visit the login page', async function () {
				await pageLogin.visit();
				await page.waitForURL( /log-in/ );
			} );

			await test.step( 'And I submit valid credentials', async function () {
				await expectPasswordLoginSucceedsWithoutSessionId(
					page,
					pageLogin,
					credentials.username as string,
					credentials.password
				);
			} );

			await test.step( 'Then I leave the login page', async function () {
				await page.waitForURL( ( url ) => ! url.pathname.includes( '/log-in' ), {
					waitUntil: 'commit',
					timeout: 60 * 1000,
				} );
			} );
		} );
	}
);
