import { Page, ElementHandle } from 'playwright';

const selectors = {
	// Comment
	commentTextArea: '#comment',
	submitButton: 'input:has-text("Post Comment")',

	// Comment like
	comments: '.comment-content',
	likeButton: '.comment-like-link',
	notLiked: '.comment-not-liked',
	liked: '.comment-liked',
};

/**
 * Represents the comments section of a post.
 */
export class CommentsComponent {
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
	 * Fills and posts a comment in the post's comment section.
	 *
	 * @param {string} comment Text to be entered as a comment.
	 * @returns {Promise<void>} No return value.
	 */
	async postComment( comment: string ): Promise< void > {
		// Wait for all network connections to complete. Otherwise, the Post Comment button may not
		// appear even if the text area is clicked on.
		await this.page.waitForLoadState( 'networkidle' );
		// Wait until the comment text area is fully stable on the page.
		// This is to guard against long-loading pages (eg. notifications test) where all network
		// requests may have completed but the page remains in a loading state.
		const commentArea = await this.page.waitForSelector( selectors.commentTextArea );
		await commentArea.waitForElementState( 'stable' );
		// To simulate user action first click on the field. This also exposes the
		// submit comment button.
		await this.page.click( selectors.commentTextArea );
		await this.page.fill( selectors.commentTextArea, comment );
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.submitButton ),
		] );
	}

	/**
	 * Selects the comment then clicks the `Like` star shaped button of the comment.
	 *
	 * This method takes two forms of selectors:
	 *     - number to specify the nth comment.
	 *     - string to specify the comment using string matching.
	 *
	 * This helper method does not check whether the button state has changed.
	 * To ensure the state changed to the expected value, the caller should perform additional
	 * checks.
	 *
	 * @param {number|string} selector Unique selector for the comment.
	 * @returns {Promise<ElementHandle>} The target comment.
	 * @throws {Error} If selector was not supplied or supplied selector did not resolve to a comment.
	 */
	async _click( selector: string | number ): Promise< ElementHandle > {
		let commentToLike!: ElementHandle;

		await this.waitUntilLoaded();

		// Retrieve the nth comment on the page.
		if ( typeof selector === 'number' ) {
			commentToLike = await this.page.waitForSelector(
				`:nth-match(${ selectors.comments }, ${ selector })`
			);
		}

		// Retrieve the comment by the body.
		if ( typeof selector === 'string' ) {
			selector = selector.trim();
			commentToLike = await this.page.waitForSelector(
				`.comment-content:has-text("${ selector }")`,
				{ state: 'visible' }
			);
		}

		// Retrieve the like/unlike button for the comment to interact with, click on it and
		// wait until the `load` event is fired confirming the end of the sequence.
		const likeButton = await commentToLike.waitForSelector( selectors.likeButton );
		await likeButton.click();
		await this.page.waitForLoadState( 'load' );

		// Return the comment to the caller for further processing.
		return commentToLike;
	}

	/**
	 * Given a selector, like the comment and verify its outcome.
	 *
	 * This method accepts either a 1-indexed number denoting the nth comment on the post to like,
	 * or a string that resolves to the body of a comment.
	 *
	 * @param {number|string} selector Either a 1-indexed number or a string.
	 * @returns {Promise<void>} No return value.
	 */
	async like( selector: number | string ): Promise< void > {
		const comment = await this._click( selector );
		await comment.waitForSelector( selectors.liked );
	}

	/**
	 * Given a selector, unlike the comment and verify its outcome.
	 *
	 * This method accepts either a 1-indexed number denoting the nth comment on the post to like,
	 * or a string that resolves to the body of a comment.
	 *
	 * @param {number|string} selector Either a 1-indexed number or a string.
	 * @returns {Promise<void>} No return value.
	 */
	async unlike( selector: number | string ): Promise< void > {
		const comment = await this._click( selector );
		await comment.waitForSelector( selectors.notLiked );
	}
}
