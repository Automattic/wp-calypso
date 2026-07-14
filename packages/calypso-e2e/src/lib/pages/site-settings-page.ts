import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Sites > Site > Settings page.
 */
export class SiteSettingsPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visits the `/sites/$siteSlug/settings` page and optionally drill into a sub-page.
	 *
	 * @param {string} siteSlug Site URL.
	 */
	async visit( siteSlug: string, subPathSlug?: string ): Promise< void > {
		const pageUrl = getCalypsoURL(
			`sites/${ siteSlug }/settings${ subPathSlug ? `/${ subPathSlug }` : '' }`
		);
		await this.page.goto( pageUrl, {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Start the site launch process.
	 * Must be on the "Site visibility" sub-page.
	 *
	 * The launch control usually carries an href and so renders as a link, but on
	 * the immediate-launch path it only has a click handler and renders as a
	 * button. Match either.
	 */
	async launchSite(): Promise< void > {
		const name = 'Launch your site';
		const launchSite = this.page
			.getByRole( 'link', { name } )
			.or( this.page.getByRole( 'button', { name } ) )
			.first();
		await launchSite.click();
	}

	/**
	 * Navigates to a given settings sub-path by label.
	 *
	 * @param {string} itemLabel Item to navigate to.
	 */
	async navigateToSubmenu( itemLabel: string ) {
		await this.page.getByRole( 'link', { name: itemLabel } ).click();
	}

	/**
	 * Given text, clicks on a button with matching text.
	 *
	 * @param {string} text Text to search on the button.
	 */
	async clickButton( text: string ) {
		await this.page.getByRole( 'button', { name: text } ).click();
	}
}
