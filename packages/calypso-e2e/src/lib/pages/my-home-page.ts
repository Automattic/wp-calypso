import { Page } from 'playwright';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',
	homePageContainer: '.is-section-home',

	// Task card (topmost card)
	taskHeadingMessage: ( message: string ) => `div.task h2:has-text("${ message }")`,
	siteTitle: ( title: string ) => `div.site__title:has-text("${ title }")`,
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
	 * the string is shown on the Task card heading.
	 *
	 * @param {string} message Partial or fully matching text to search.
	 */
	async validateTaskHeadingMessage( message: string ): Promise< void > {
		await this.page.waitForSelector( selectors.taskHeadingMessage( message ) );
	}

	/**
	 * Given a partial or full string, verify a site title containing the
	 * string is displayed on the home page.
	 *
	 * @param {string} title Partial or fully matching site title.
	 */
	async validateSiteTitle( title: string ): Promise< void > {
		await this.page.locator( selectors.siteTitle( title ) );
	}

	/**
	 * Validates we've landed on the home page screen.
	 */
	async validateOnHomePage(): Promise< void > {
		await this.page.locator( selectors.homePageContainer );
	}
}
