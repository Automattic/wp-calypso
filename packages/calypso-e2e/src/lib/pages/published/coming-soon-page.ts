import { Page } from 'playwright';

const selectors = {
	comingSoonText: ':text("Coming Soon")',
};

/**
 * Represents the Coming Soon page when the site has not yet launched.
 */
export class ComingSoonPage {
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
	 * Validates the site is in coming soon state.
	 */
	async validateComingSoonState(): Promise< void > {
		await this.page.waitForSelector( selectors.comingSoonText );
	}
}
