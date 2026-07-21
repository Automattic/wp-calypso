import { Page } from 'playwright';

/**
 * Page representing a single site's Domains screen (`/sites/:slug/domains`) in
 * the Multi-site Dashboard.
 */
export class DashboardSiteDomainsPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the "Add domain name" menu and selects the option to search for a
	 * new domain, which hands off to the domain search flow.
	 */
	async searchForNewDomain(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Add domain name' } ).click();
		await this.page.getByRole( 'menuitem', { name: 'Search domain names' } ).click();
	}
}
