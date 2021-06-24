/**
 * Internal dependencies
 */
import { BaseContainer } from '../../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	posts: '.type-post h2 a',
};

/**
 * Represents the published site's post list page.
 *
 * @augments {BaseContainer}
 */
export class PublishedPostsListPage extends BaseContainer {
	/**
	 * Constructs an instance of the PublishedPostsListPage.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Given 1-indexed post number n, visits the nth post on the published site's post listing.
	 *
	 * @param {number} postNumber The nth post to visit. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 */
	async visitPost( postNumber = 1 ): Promise< void > {
		const post = await this.page.waitForSelector(
			`:nth-match(${ selectors.posts }, ${ postNumber })`
		);
		await Promise.all( [ this.page.waitForNavigation(), post.click() ] );
	}
}
