import { Page } from 'playwright';
import { envVariables } from '../..';
import { waitForWPWidgets } from '../../element-helper';

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
	 * Posts a comment with given text.
	 *
	 * @param {string} comment Comment text.
	 * @returns {Promise<void>} No return value.
	 */
	async postComment( comment: string ): Promise< void > {
		const commentForm = this.page.locator( '#commentform' );
		await commentForm.scrollIntoViewIfNeeded();

		let commentField;
		let submitButton;

		if ( envVariables.TEST_ON_ATOMIC ) {
			const parentFrame = this.page.frameLocator( '#jetpack_remote_comment' );

			commentField = parentFrame.locator( '#comment' );
			submitButton = parentFrame.locator( 'input:has-text("Post Comment")' );
		} else {
			commentField = this.page.locator( '#comment' );
			submitButton = this.page.locator( 'input:has-text("Post Comment")' );
		}

		await commentField.type( comment );
		await Promise.all( [ this.page.waitForNavigation(), submitButton.click() ] );
	}

	/**
	 * Likes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to like.
	 * @returns {Promise<void>} No return value.
	 */
	async like( comment: string ): Promise< void > {
		let likeButton;
		let likedStatus;

		if ( envVariables.TEST_ON_ATOMIC ) {
			// Atomic site loads the like button via a widgets.wp.com iframe.
			// Playwright's actionability checks are no good here because the
			// button becomes actionable after the widget script is fully
			// initialized, which is not indicated anywhere in the DOM. We need
			// to use the following custom waiter to ensure the button is ready
			// to be interacted with. Otherwise, the like click will do nothing.
			await waitForWPWidgets( this.page );

			const likeButtonFrame = this.page.frameLocator(
				`iframe[name^="like-comment-frame"]:below(:text("${ comment }"))`
			);

			likeButton = likeButtonFrame.locator( 'a:text-is("Like"):visible' );
			likedStatus = likeButtonFrame.locator( ':text("Liked by"):visible' );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: comment } );

			likeButton = commentContent.locator( ':text-is("Like"):visible' );
			likedStatus = commentContent.locator( ':text("Liked by"):visible' );
		}

		await likeButton.click();
		await likedStatus.waitFor();
	}

	/**
	 * Unlikes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to unlike.
	 * @returns {Promise<void>} No return value.
	 */
	async unlike( comment: string ): Promise< void > {
		let unlikeButton;
		let unlikedStatus;

		if ( envVariables.TEST_ON_ATOMIC ) {
			// See the like() method for info on the following method call.
			await waitForWPWidgets( this.page );

			const likeButtonFrame = this.page.frameLocator(
				`iframe[name^="like-comment-frame"]:below(:text("${ comment }"))`
			);

			unlikeButton = likeButtonFrame.locator( 'a:text("Liked by")' );
			unlikedStatus = likeButtonFrame.locator( 'a:text-is("Like")' );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: comment } );

			unlikeButton = commentContent.locator( '.comment-liked:has-text("Liked by") > a' );
			unlikedStatus = commentContent.locator( '.comment-not-liked > span:text-is("Like"):visible' );
		}

		await unlikeButton.click();
		await unlikedStatus.waitFor();
	}
}
