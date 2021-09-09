import { Page } from 'playwright';

/**
 * Represents the sidebar component on /me endpoint.
 */
export class MeSidebarComponent {
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
	 * Given a string, navigate to the menu on the sidebar.
	 *
	 * @param {string} menu Menu item to navigate to.
	 */
	async navigate( menu: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( `a:has(span:has-text("${ menu }") )` ),
		] );
	}
}
