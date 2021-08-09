import { Page } from 'playwright';

export type StatsTabs = 'Traffic' | 'Insights' | 'Store';

const selectors = {
	tabItems: ( name: StatsTabs ) => `a:has-text("${ name }")`,
};

/**
 * Represents the Statistics page.
 */
export class StatsPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a string, click on the tab name on the page.
	 *
	 * @param {StatsTabs} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTabItem( name: StatsTabs ): Promise< void > {
		await this.page.click( selectors.tabItems( name ) );

		// Confirm the tab is now selected.
		await this.page.waitForSelector( `*css=li.is-selected >> ${ selectors.tabItems( name ) }` );
	}
}
