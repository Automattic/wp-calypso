import { Page } from 'playwright';

const selectors = {
	newPostButton: 'button:has-text("New Post")',
	publishedPost: ( postContent: string ) => `.entry-content:has-text("${ postContent }")`,
};

/**
 * Class representing the P2 frontend.
 */
export class P2Page {
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
	 * Click 'New post' to show the editor.
	 */
	async clickNewPost(): Promise< void > {
		await this.page.click( selectors.newPostButton );
	}

	/**
	 * Ensures the post with the content `postContent` has been published.
	 *
	 * @param {string} postContent Post content to validate.
	 */
	async validatePostContent( postContent: string ): Promise< void > {
		await this.page.click( selectors.publishedPost( postContent ) );
	}
}
