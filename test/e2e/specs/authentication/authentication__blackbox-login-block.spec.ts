import { useBlackboxTestKeyForCollect } from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: Blackbox login block', { tag: [ tags.AUTHENTICATION ] }, () => {
	test( 'As a WordPress.com user, I cannot log in when Blackbox returns block', async ( {
		page,
		pageLogin,
		secrets,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		const credentials = secrets.testAccounts.defaultUser;

		await test.step( 'Given Blackbox collect uses the public block test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'block' );
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
			expect( body?.data?.session_id ).toBe( 'bbtest_block__________' );
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

			expect( postData.get( 'blackbox_session_id' ) ).toBe( 'bbtest_block__________' );
			expect( response.status() ).toBe( 400 );
			expect( body?.success ).toBe( false );
		} );

		await test.step( 'Then I see a login error', async function () {
			await expect( page.locator( '.calypso-notice.is-error' ) ).toBeVisible();
		} );

		await test.step( 'And I remain on the login page', async function () {
			await expect( page ).toHaveURL( /log-in/ );
		} );
	} );
} );
