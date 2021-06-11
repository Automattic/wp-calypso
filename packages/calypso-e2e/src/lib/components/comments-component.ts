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
	topLevelComments: '.comment-list .depth-1:not(.children)',
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
	 * Performs the click action on the comment's like button.
	 *
	 * This helper method does not check whether the button state has changed.
	 * To ensure the state changed to the expected value, the caller should perform additional
	 * checks.
	 *
	 * @param {number} commentNumber The nth comment to click like on.
	 * @returns {Promise<void>} No return value.
	 */
	async _click( commentNumber: number ): Promise< ElementHandle > {
		// Wait for comments to load, then select all matching comments.
		// For now, only interact with top level comments since child comments introduce
		// a whole new layer of complexity.
		await this.page.waitForSelector( selectors.commentsList, { state: 'visible' } );
		const topLevelComments = await this.page.$$( selectors.topLevelComments );

		if ( commentNumber > topLevelComments.length ) {
			throw new Error(
				`Post has comment count of ${ topLevelComments.length }, was asked to like comment number ${ commentNumber }`
			);
		}

		// Obtain the ElementHandle to the comment to have its button clicked, then look for the button itself.
		const commentToLike = topLevelComments[ commentNumber - 1 ];
		const likeButton = ( await commentToLike.$( selectors.likeButton ) ) as ElementHandle;
		// Click the like button and wait until the animations are done.
		await Promise.all( [ likeButton.click(), likeButton.waitForElementState( 'enabled' ) ] );

		// Return the comment to the caller for further processing.
		return commentToLike;
	}

	/**
	 * Like the comment.
	 *
	 * This method will check the target comment has indeed been liked.
	 *
	 * @param {[key: string]: number} param0 Parameter object.
	 * @param {number} param0.commentNumber The nth comment to click like on, 1-indexed. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 */
	async like( { commentNumber = 1 }: { commentNumber: number } ): Promise< void > {
		const comment = await this._click( commentNumber );
		await comment.waitForSelector( selectors.liked );
	}

	/**
	 * Unlike the comment.
	 *
	 * This method will check the target comment has indeed been unliked.
	 *
	 * @param {[key: string]: number} param0 Parameter object.
	 * @param {number} param0.commentNumber The nth comment to click unlike on, 1-indexed. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 */
	async unlike( { commentNumber = 1 }: { commentNumber: number } ): Promise< void > {
		const comment = await this._click( commentNumber );
		await comment.waitForSelector( selectors.notLiked );
	}
}
