import { useBlackboxTestKeyForCollect } from '../../lib/blackbox-test-key';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Authentication: Blackbox login challenge', { tag: [ tags.AUTHENTICATION ] }, () => {
	test( 'As a WordPress.com user, I see a challenge and cannot submit while it is active', async ( {
		page,
		pageLogin,
	}, workerInfo ) => {
		test.skip(
			workerInfo.project.name !== 'authentication',
			'The authentication project is the only one that has the right browser settings for authentication tests'
		);

		await test.step( 'Given Blackbox collect uses the public challenge test key', async function () {
			await useBlackboxTestKeyForCollect( page, 'challenge' );
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

			expect( body?.data?.session_id ).toBe( 'bbtest_challenge______' );
			expect( body?.data?.challenge ).toBeTruthy();
		} );

		await test.step( 'Then the challenge widget is shown and submit is blocked', async function () {
			await expect(
				page.locator( '.login__form-blackbox-challenge.has-visible-challenge' )
			).toBeVisible();
			await expect( page.locator( 'button[type="submit"]' ) ).toBeDisabled();
		} );
	} );
} );
