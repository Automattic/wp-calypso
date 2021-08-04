import { Page } from 'playwright';

const selectors = {
	posts: '.type-post h2 a',
};

/**
 * Represents the published site's post list page.
 */
export class PublishedPostsListPage {
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
	 * Initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitUntilLoaded(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Given 1-indexed post number n, visits the nth post on the published site's post listing.
	 *
	 * @param {number} postNumber The nth post to visit. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 */
	async visitPost( postNumber = 1 ): Promise< void > {
		await this.waitUntilLoaded();

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( `:nth-match(${ selectors.posts }, ${ postNumber })` ),
		] );
	}
}
