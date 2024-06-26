import { Page } from 'playwright';
import { envVariables } from '../..';
import { waitForWPWidgetsIfNecessary } from '../../element-helper';

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
	 */
	async postComment( comment: string ): Promise< void > {
		const commentForm = this.page.locator( '#commentform' );
		await commentForm.scrollIntoViewIfNeeded();

		let commentField;
		let submitButton;

		if ( envVariables.TEST_ON_ATOMIC ) {
			// Although the comment iframe does not come from widgets.wp.com,
			// there are other widgets on the same page that do, and until
			// they're not fully loaded, the layout will keep shifting causing
			// misclicks from time to time. The general reason for the layout
			// shifting is that all the widgets are loaded via an iframe, and
			// their sizes are not immediately set. For example, the Likes
			// button height is re-calculated within a 500ms interval which can
			// bypass Playwright's stability check.
			await waitForWPWidgetsIfNecessary( this.page );

			const parentFrame = this.page.frameLocator( '#jetpack_remote_comment' );

			commentField = parentFrame.locator( '#comment' );
			submitButton = parentFrame.locator( 'input:has-text("Post Comment")' );
		} else {
			commentField = this.page.locator( '#comment' );
			submitButton = this.page.locator( 'input:has-text("Post Comment")' );
		}

		await commentField.type( comment );

		await submitButton.click();
	}

	/**
	 * Likes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to like.
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
			// to be interacted with. Otherwise, the like click will most likely
			// do nothing.
			await waitForWPWidgetsIfNecessary( this.page );

			const likeButtonFrame = this.page
				.frameLocator( `iframe[name^="like-comment-frame"]:below(:text("${ comment }"))` )
				.first();

			likeButton = likeButtonFrame.getByRole( 'link', { name: 'Like' } );
			likedStatus = likeButtonFrame.getByRole( 'link', { name: 'Liked by you' } );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: comment } );

			likeButton = commentContent.locator( ':text-is("Like"):visible' );
			likedStatus = commentContent.locator( ':text("Liked by"):visible' );
		}

		await this.page.getByText( comment ).scrollIntoViewIfNeeded();
		await likeButton.waitFor();
		await likeButton.click();
		// On Atomic, we add a second click since the first one opens a window to log-in the user.
		if ( envVariables.TEST_ON_ATOMIC ) {
			await this.page.waitForTimeout( 5 * 1000 );
			await likeButton.waitFor();
			await likeButton.click();
		}
		await likedStatus.waitFor();
	}

	/**
	 * Unlikes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to unlike.
	 */
	async unlike( comment: string ): Promise< void > {
		let unlikeButton;
		let unlikedStatus;

		if ( envVariables.TEST_ON_ATOMIC ) {
			// See the like() method for info on the following method call.
			await waitForWPWidgetsIfNecessary( this.page );

			const commentContent = this.page.locator( '.comment-content', { hasText: comment } );
			const likeButtonFrame = commentContent.frameLocator( "iframe[name^='like-comment-frame']" );

			unlikeButton = likeButtonFrame.getByRole( 'link', { name: 'Liked by you' } );
			unlikedStatus = likeButtonFrame.getByRole( 'link', { name: 'Like' } );
		} else {
			const commentContent = this.page.locator( '.comment-content', { hasText: comment } );

			unlikeButton = commentContent.locator( '.comment-liked:has-text("Liked by") > a' );
			unlikedStatus = commentContent.locator( '.comment-not-liked > span:text-is("Like"):visible' );
		}

		await this.page.getByText( comment ).scrollIntoViewIfNeeded();
		await unlikeButton.click();
		await unlikedStatus.waitFor();
	}
}
