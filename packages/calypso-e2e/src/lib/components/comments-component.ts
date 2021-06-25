/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page, ElementHandle } from 'playwright';

const selectors = {
	// Comment
	commentArea: '.comments-area',
	commentTextArea: '#comment',
	submitButton: '.form-submit #comment-submit',

	// Comment like
	commentsList: '.comment-list',
	comments: '.comment-content',
	likeButton: '.comment-like-link',
	notLiked: '.comment-not-liked',
	liked: '.comment-liked',
};

/**
 * Represents the comments section of a post.
 *
 * @augments {BaseContainer}
 */
export class CommentsComponent extends BaseContainer {
	/**
	 * Constructs and instance of the CommentsComponent.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.commentArea );
	}

	/**
	 * Overrides the parent method for post-initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
	}

	/**
	 * Fills and posts a comment in the post's comment section.
	 *
	 * @param {string} comment Text to be entered as a comment.
	 * @returns {Promise<void>} No return value.
	 */
	async postComment( comment: string ): Promise< void > {
		await this.page.fill( selectors.commentTextArea, comment );
		await this.page.click( selectors.submitButton );
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
		let commentToLike;

		await this.page.waitForSelector( selectors.commentsList, { state: 'visible' } );

		if ( typeof selector === 'number' ) {
			commentToLike = await this.page.waitForSelector(
				`:nth-match(${ selectors.comments }, ${ selector })`
			);
		}

		if ( typeof selector === 'string' ) {
			selector = selector.trim();
			commentToLike = await this.page.waitForSelector(
				`.comment-content:has-text("${ selector }")`,
				{ state: 'visible' }
			);
		}

		if ( ! commentToLike ) {
			throw new Error( `Failed to select a comment. Please check the comment number or selector.` );
		}

		await commentToLike.waitForElementState( 'stable' );

		const likeButton = ( await commentToLike.$( selectors.likeButton ) ) as ElementHandle;
		// Click the like button and wait until the animations are done.
		await Promise.all( [ likeButton.click(), likeButton.waitForElementState( 'enabled' ) ] );

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
