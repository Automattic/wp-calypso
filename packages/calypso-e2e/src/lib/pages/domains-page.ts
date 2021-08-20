import { Page } from 'playwright';

const selectors = {
	searchForDomainButton: `a:text-matches("*earch for a domain", "i")`,
};

/**
 * Page representing the Upgrades > Domains page.
 */
export class DomainsPage {
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
	 * Clicks on the button to add a domain to the site.
	 */
	async addDomain(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.searchForDomainButton ),
		] );
	}
}
