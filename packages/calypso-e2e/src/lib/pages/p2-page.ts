import { Page } from 'playwright';

const selectors = {
	newPostButton: 'button:has-text("New Post")',
	editorInserterToggle: 'button[aria-label="Toggle block inserter"]',
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
		// The button is server-rendered before its click handler hydrates; a
		// too-early click is silently lost, so retry until the editor opens.
		const inserterToggle = this.page.locator( selectors.editorInserterToggle );
		for ( let attempt = 0; attempt < 3; attempt++ ) {
			if ( await inserterToggle.isVisible() ) {
				return;
			}
			await this.page.click( selectors.newPostButton );
			try {
				await inserterToggle.waitFor( { state: 'visible', timeout: 5000 } );
				return;
			} catch {
				// Handler was not attached yet; click again.
			}
		}
		throw new Error( 'Editor did not open after clicking "New Post".' );
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
