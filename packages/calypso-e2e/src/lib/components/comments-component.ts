import { Page } from 'playwright';
import { envVariables } from '../..';
import { waitForWPWidgets } from '../../element-helper';

const selectors = {
	// Comment
	commentForm: '#commentform',
	commentIframe: '#jetpack_remote_comment',
	commentField: '#comment',
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
	 * Fills and posts a comment in the post's comment section.
	 *
	 * @param {string} comment Text to be entered as a comment.
	 * @returns {Promise<void>} No return value.
	 */
	async postComment( comment: string ): Promise< void > {
		const commentForm = this.page.locator( selectors.commentForm );
		await commentForm.scrollIntoViewIfNeeded();

		let commentField;
		let submitButton;

		if ( envVariables.TEST_ON_ATOMIC ) {
			const parentFrame = this.page.frameLocator( selectors.commentIframe );
			commentField = parentFrame.locator( selectors.commentField );
			submitButton = parentFrame.locator( selectors.submitButton );
		} else {
			commentField = this.page.locator( selectors.commentField );
			submitButton = this.page.locator( selectors.submitButton );
		}

		await commentField.type( comment );
		await Promise.all( [ this.page.waitForNavigation(), submitButton.click() ] );
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
	async like( selector: string ): Promise< void > {
		let likeButton;
		let likedStatus;

		if ( envVariables.TEST_ON_ATOMIC ) {
			await waitForWPWidgets( this.page );

			const likeButtonFrame = this.page.frameLocator(
				`iframe[name^="like-comment-frame"]:below(:text("${ selector }"))`
			);

			likeButton = likeButtonFrame.locator( 'a:text-is("Like"):visible' );
			likedStatus = likeButtonFrame.locator( ':text("Liked by"):visible' );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: selector } );
			likeButton = commentContent.locator( ':text-is("Like"):visible' );
			likedStatus = commentContent.locator( ':text("Liked by"):visible' );
		}

		await likeButton.click();
		await likedStatus.waitFor();
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
	async unlike( selector: string ): Promise< void > {
		let unlikeButton;
		let unlikedStatus;

		if ( envVariables.TEST_ON_ATOMIC ) {
			await waitForWPWidgets( this.page );

			const likeButtonFrame = this.page.frameLocator(
				`iframe[name^="like-comment-frame"]:below(:text("${ selector }"))`
			);

			unlikeButton = likeButtonFrame.locator( 'a:text("Liked by")' );
			unlikedStatus = likeButtonFrame.locator( 'a:text-is("Like")' );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: selector } );
			unlikeButton = commentContent.locator( '.comment-liked:has-text("Liked by") > a' );
			unlikedStatus = commentContent.locator( '.comment-not-liked > span:text-is("Like"):visible' );
		}

		await unlikeButton.click();
		await unlikedStatus.waitFor();
	}
}
