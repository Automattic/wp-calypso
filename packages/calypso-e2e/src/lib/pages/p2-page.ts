import { Page } from 'playwright';

const selectors = {
	newPostButton: 'button:has-text("New Post")',
	editorInserterToggle: 'button[aria-label="Toggle block inserter"]',
	publishedPost: ( postContent: string ) => `.entry-content:has-text("${ postContent }")`,
};

const EDITOR_MOUNT_TIMEOUT = 10 * 1000;

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
		// P2 defers the editor bundle: the click fetches and serially executes the
		// Gutenberg scripts before the editor mounts, ~7s on a loaded CI agent.
		await this.page.click( selectors.newPostButton );
		await this.page
			.locator( selectors.editorInserterToggle )
			.waitFor( { state: 'visible', timeout: EDITOR_MOUNT_TIMEOUT } );
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
