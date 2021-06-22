/**
 * Internal dependencies
 */
import { BaseContainer } from '../../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	page: '#main',
	posts: '.type-post',
	postedDate: '.type-post footer .posted-on a',
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
		super( page, selectors.page );
	}

	/**
	 * Post-object creation initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForSelector( selectors.posts );
	}

	/**
	 * Given 1-indexed post number n, visits the nth post on the published site's post listing.
	 * This method assumes there is at least 1 existing post on the site.
	 *
	 * @param {number} postNumber The nth post to visit. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 */
	async visitPost( postNumber = 1 ): Promise< void > {
		const posts = await this.page.$$( selectors.postedDate );

		// If told to open nth post when there are less than n posts, that is not possible.
		if ( postNumber > posts.length ) {
			throw new Error(
				`Site has post count of ${ posts.length }, was asked for post number ${ postNumber }`
			);
		}

		await posts[ postNumber - 1 ].click();
	}
}
