import { URL } from 'url';
import { Page, Response } from 'playwright';
import { getCalypsoURL, parseSiteHostFromUrl } from '../../data-helper';
import envVariables from '../../env-variables';

const selectors = {
	addNewPageButton: 'a:has-text("Add new page")',
};

/**
 * Represents the Pages page
 */
export class PagesPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the Pages page.
	 *
	 * Example {@link https://wordpress.com/pages}
	 */
	async visit(): Promise< Response | null > {
		const [ , response ] = await Promise.all( [
			// We need to wait until the site-specific redirect happens.
			this.page.waitForNavigation( { url: '**/pages/**' } ),
			this.page.goto( getCalypsoURL( 'pages' ) ),
		] );
		return response;
	}

	/**
	 * Start a new page using the 'Add new page' button.
	 */
	async addNewPage(): Promise< void > {
		const newPageLocator = this.page.locator( selectors.addNewPageButton );

		// Get ready for some temporary yuckiness!
		// On atomic sites, the Gutenframe does not play well with our E2E tests.
		// For the time being, we need to make redirect any click navigations from this Calypso page
		// to the wp-admin version of the editor.
		if ( envVariables.TEST_ON_ATOMIC ) {
			const siteHostName = parseSiteHostFromUrl( this.page.url() );
			const wpAdminEditorUrl = new URL( `https://${ siteHostName }` );
			wpAdminEditorUrl.pathname = '/wp-admin/post-new.php';
			wpAdminEditorUrl.searchParams.append( 'post_type', 'page' );
			wpAdminEditorUrl.searchParams.append( 'calypsoify', '1' );

			await newPageLocator.evaluate(
				( node, newHref ) => node.setAttribute( 'href', newHref ),
				wpAdminEditorUrl.href
			);
		}
		await newPageLocator.click();
	}
}
