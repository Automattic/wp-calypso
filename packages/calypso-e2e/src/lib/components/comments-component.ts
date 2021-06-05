/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	commentArea: '.comments-area',
	commentTextArea: '#comment',
	submitButton: '.form-submit #comment-submit',
};

/**
 * Represents the comments section of a post.
 *
 * @augments {BaseContainer}
 */
export class CommentsComponent extends BaseContainer {
	constructor( page: Page ) {
		super( page, selectors.commentArea );
	}

	/**
	 * Fills and posts a comment in the post's comment section.
	 *
	 * @param {string} comment Text to be entered as a comment.
	 * @returns {Promise<void>} No return value.
	 */
	async postComment( comment: string ): Promise< void > {
		await this.page.waitForSelector( selectors.commentTextArea );
		await this.page.fill( selectors.commentTextArea, comment );
		await this.page.click( selectors.submitButton );
	}
}
