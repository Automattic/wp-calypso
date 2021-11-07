import { Page } from 'playwright';

const selectors = {
	// Common selectors
	button: ( text: string ) => `button:text-is("${ text }")`,

	// Launch site
	launchSiteButton: 'a:text("Launch site")',

	// Site Tools
	deleteSiteLinkItem: `p:text-is("Delete your site permanently")`,
	deleteSiteConfirmInput: `input[id="confirmDomainChangeInput"]`,
	deleteSiteConfirmationSpan: 'span:has-text("is being deleted")',
};

/**
 * Represents the Settings > General Settings page.
 */
export class GeneralSettingsPage {
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
	 * Start the site launch process.
	 */
	async launchSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.launchSiteButton ),
		] );
	}

	/**
	 * Performs steps related to site deletion.
	 *
	 * @param {string} url URL of the site to be deleted.
	 */
	async deleteSite( url: string ): Promise< void > {
		await this.page.click( selectors.deleteSiteLinkItem );
		await this.page.click( selectors.button( 'Delete site' ) );
		await this.page.fill( selectors.deleteSiteConfirmInput, url );

		// Once the confirmation button is clicked these things happen in short order:
		//	- site deletion confirmation toast is shown.
		//	- navigation to a new page, entering state where no site is selected.
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.waitForSelector( selectors.deleteSiteConfirmationSpan ),
			this.page.click( selectors.button( 'Delete this site' ) ),
		] );
	}
}
