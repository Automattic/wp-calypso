import { Page } from 'playwright';

const selectors = {
	// Domain actions
	searchForDomainButton: `a:text-matches("search", "i")`,
	useADomainIOwnButton: `text=Use a domain I own`,

	// Purchased domains
	purchasedDomains: ( domain: string ) => `div.card:has-text("${ domain }")`,
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

	/* Initiate a domain action */

	/**
	 * Clicks on the button to add a domain to the site.
	 */
	async addDomain(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.searchForDomainButton ),
		] );
	}

	/**
	 * Click initial button to use a domain already owned by the user (make connection or transfer)
	 */
	async useADomainIOwn(): Promise< void > {
		await this.page.click( selectors.useADomainIOwnButton );
	}

	/* Interact with purchased domains */

	/**
	 * Given a partially matching string, locates and clicks on the matching purchased domain card.
	 *
	 * @param {string} domain Domain string to match on.
	 */
	async click( domain: string ): Promise< void > {
		await this.page.click( selectors.purchasedDomains( domain ) );
	}
}
