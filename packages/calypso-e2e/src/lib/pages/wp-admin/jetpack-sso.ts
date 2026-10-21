import { Page } from 'playwright';

/**
 * Clears the Jetpack SSO screen, if wp-admin answered with it.
 *
 * Atomic test sites can carry local users, so wp-admin sends the WordPress.com user to the
 * Jetpack SSO screen instead of logging them straight in. It is served by wp-login.php, so the
 * landing URL settles the question without polling for an element that is absent on the common
 * path. Clearing an already-cleared screen is a no-op, and any wp-admin navigation can get one,
 * so call this after each.
 *
 * Left unhandled, the screen fails nothing here: the caller finds out several steps later, at
 * whatever it clicks next.
 *
 * @param {Page} page Page object.
 */
export async function completeJetpackSso( page: Page ): Promise< void > {
	if ( ! page.url().includes( 'wp-login.php' ) ) {
		return;
	}

	await page.getByRole( 'link', { name: 'Log in with WordPress.com' } ).click();
	await page.waitForURL( /\/wp-admin\// );
}
