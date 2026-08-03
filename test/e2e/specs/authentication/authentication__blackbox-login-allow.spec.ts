import { useBlackboxTestKeyForCollect } from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: Blackbox login allow', { tag: [ tags.AUTHENTICATION ] }, () => {
	test( 'As a WordPress.com user, I can log in when Blackbox returns allow', async ( {
		page,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const credentials = secrets.testAccounts.defaultUser;

		await test.step( 'Given Blackbox collect uses the public allow test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'allow' );
		} );

		await test.step( 'When I visit the login page', async function () {
			const collectResponse = page.waitForResponse(
				( response ) =>
					response.request().method() === 'POST' &&
					response.url().includes( 'blackbox-api.wp.com/v1/collect' )
			);

			await pageLogin.visit();
			await page.waitForURL( /log-in/ );

			const response = await collectResponse;
			const body = await response.json();
			expect( body?.data?.session_id ).toBe( 'bbtest_allow__________' );
		} );

		await test.step( 'And I submit valid credentials', async function () {
			await pageLogin.fillUsername( credentials.username as string );
			await pageLogin.clickSubmit();
			await pageLogin.fillPassword( credentials.password );

			const loginResponse = page.waitForResponse(
				( response ) =>
					response.request().method() === 'POST' &&
					response.url().includes( 'action=login-endpoint' )
			);
			const loginRequest = page.waitForRequest(
				( request ) =>
					request.method() === 'POST' && request.url().includes( 'action=login-endpoint' )
			);

			await pageLogin.clickSubmit();
			const request = await loginRequest;
			const response = await loginResponse;
			const body = await response.json();
			const postData = new URLSearchParams( request.postData() ?? '' );

			expect( postData.get( 'blackbox_session_id' ) ).toBe( 'bbtest_allow__________' );
			expect( response.status() ).toBe( 200 );
			expect( body?.success ).toBe( true );
		} );

		await test.step( 'Then I leave the login page', async function () {
			// The redirect only fires once remoteLoginUser has settled its token-link
			// iframes, which it allows 25s each, and is then a full page load. Budget
			// past that and wait for the URL to change rather than for it to load.
			await page.waitForURL( ( url ) => ! /log-in/.test( url.toString() ), {
				waitUntil: 'commit',
				timeout: 60 * 1000,
			} );
		} );
	} );
} );
