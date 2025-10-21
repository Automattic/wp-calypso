import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Verifies the /me endpoint is functional.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/76266
 */
test.describe( 'Me: Smoke Test', { tag: [ tags.CALYPSO_PR, tags.CALYPSO_RELEASE ] }, () => {
	test( 'Navigate to Me pages', async ( { accountGivenByEnvironment, page } ) => {
		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'When I navigate to /me', async function () {
			await page.goto( DataHelper.getCalypsoURL( 'me' ) );
		} );

		const meEndpoints = [
			{ target: 'Account Settings', endpoint: 'account' },
			{ target: 'Purchases', endpoint: 'purchases' },
			{ target: 'Security', endpoint: 'security' },
			{ target: 'Privacy', endpoint: 'privacy' },
			{ target: 'Notification Settings', endpoint: 'notifications' },
			{ target: 'Blocked Sites', endpoint: 'site-blocks' },
		];

		for ( const { target, endpoint } of meEndpoints ) {
			await test.step( `Then I can navigate to Me > ${ target }`, async function () {
				const viewportSize = page.viewportSize();
				const isMobile = viewportSize && viewportSize.width < 782;

				// Expand the mobile menu if necessary.
				if ( isMobile ) {
					await page.locator( 'button[data-tip-target="mobile-menu"]' ).click();
				}

				await page
					.getByRole( 'navigation' )
					.getByRole( 'link', { name: target, exact: true } )
					.click();

				await expect( page ).toHaveURL( new RegExp( endpoint ) );
				await expect(
					page.getByRole( 'main' ).getByRole( 'heading', { name: target } )
				).toBeVisible();
			} );
		}
	} );
} );
