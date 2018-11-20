/**
 * Node dependencies
 */
import { visitAdmin, switchToAdminUser, switchToTestUser } from './utils';

/**
 * Install a plugin from the WP.org repository.
 *
 * @param {string} slug        Plugin slug.
 * @param {string?} searchTerm If the plugin is not findable by its slug use an alternative term to search.
 */
export async function installPlugin( slug, searchTerm ) {
	await switchToAdminUser();
	await visitAdmin( 'plugin-install.php?s=' + encodeURIComponent( searchTerm || slug ) + '&tab=search&type=term' );
	await page.click( '.install-now[data-slug="' + slug + '"]' );
	await page.waitForSelector( '.activate-now[data-slug="' + slug + '"]' );
	await switchToTestUser();
}

/**
 * Activates an installed plugin.
 *
 * @param {string} slug Plugin slug.
 */
export async function activatePlugin( slug ) {
	await switchToAdminUser();
	await visitAdmin( 'plugins.php' );
	await page.click( 'tr[data-slug="' + slug + '"] .activate a' );
	await page.waitForSelector( 'tr[data-slug="' + slug + '"] .deactivate a' );
	await switchToTestUser();
}

/**
 * Deactivates an active plugin.
 *
 * @param {string} slug Plugin slug.
 */
export async function deactivatePlugin( slug ) {
	await switchToAdminUser();
	await visitAdmin( 'plugins.php' );
	await page.click( 'tr[data-slug="' + slug + '"] .deactivate a' );
	await page.waitForSelector( 'tr[data-slug="' + slug + '"] .delete a' );
	await switchToTestUser();
}

/**
 * Uninstall a plugin.
 *
 * @param {string} slug Plugin slug.
 */
export async function uninstallPlugin( slug ) {
	await switchToAdminUser();
	await visitAdmin( 'plugins.php' );
	const confirmPromise = new Promise( ( resolve ) => {
		page.once( 'dialog', () => resolve() );
	} );
	await Promise.all( [
		confirmPromise,
		page.click( 'tr[data-slug="' + slug + '"] .delete a' ),
	] );
	await page.waitForSelector( 'tr[data-slug="' + slug + '"].deleted' );
	await switchToTestUser();
}
