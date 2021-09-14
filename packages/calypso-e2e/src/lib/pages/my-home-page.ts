import { Page } from 'playwright';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',

	// Task card (topmost card)
	taskMessage: ( message: string ) => `div.task h2:has-text("${ message }")`,
};

/**
 * Page representing the WPCOM home dashboard.
 */
export class MyHomePage {
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
	 * Click on the Visit Site button on the home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async visitSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.visitSiteButton ),
		] );
	}

	/**
	 * Given a partial or full string, verify that a message containing
	 * the string is shown on the Task card.
	 *
	 * @param {string} message Partial or fully matching text to search.
	 */
	async validateTaskMessage( message: string ): Promise< void > {
		await this.page.waitForSelector( selectors.taskMessage( message ) );
	}
}
