import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	postItem: ( title: string ) => `div.post-item:has-text("${ title }")`,
};

/**
 * Represents the Posts page.
 */
export class PostsPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the Posts page.
	 *
	 * Example {@link https://wordpress.com/posts}
	 */
	async visit(): Promise< Response | null > {
		return await this.page.goto( getCalypsoURL( 'posts' ) );
	}

	/**
	 * Given a post title, click on the post, triggering a navigation
	 * to the editor page.
	 *
	 * @param {string} title Partial or full string of the post.
	 */
	async clickPost( title: string ): Promise< void > {
		await this.page.click( selectors.postItem( title ) );
	}
}
