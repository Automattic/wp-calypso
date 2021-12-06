import { Page } from 'playwright';

const selectors = {
	inputPrompt: 'span.p2020-editor-placeholder__prompt',
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
	 * Click on the front-end (inline) editor on top of the P2.
	 *
	 * Without this step, the IsolatedBlockEditorComponent will not be
	 * able to locate the editor.
	 *
	 */
	async focusInlineEditor(): Promise< void > {
		await this.page.click( selectors.inputPrompt );
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
