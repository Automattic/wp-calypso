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
 * Represents the published site's post listings page.
 *
 * @augments {BaseContainer}
 */
export class PublishedPostsListPage extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.page );
	}

	/**
	 * Clicks and visits the post from the published site's post listing.
	 *
	 * @param {number} postNumber The nth post to visit. Defaults to 1.
	 */
	async visitPost( postNumber = 1 ) {
		// const posts = await this.page.$$( selectors.posts );
		const posts = await this.page.$$( selectors.postedDate );

		if ( postNumber > posts.length ) {
			throw new Error(
				`Site has post count of ${ posts.length }, was asked for post number ${ postNumber }`
			);
		}

		await posts[ postNumber - 1 ].click();
	}
}
