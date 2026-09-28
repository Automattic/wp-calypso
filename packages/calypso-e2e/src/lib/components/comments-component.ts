import { Page } from 'playwright';
import { envVariables } from '../..';
import { waitForWPWidgetsIfNecessary } from '../../element-helper';

// Atomic's like widget relabels itself slowly; every wait around it gets the same budget.
const likeWidgetTimeout = envVariables.TEST_ON_ATOMIC ? 30 * 1000 : undefined;

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
	 * Returns the like widget of a comment in both of its states.
	 *
	 * @param {string} comment Text of the comment.
	 */
	private async likeLocators( comment: string ) {
		const commentContent = this.page.locator( '.comment-content', { hasText: comment } );

		if ( envVariables.TEST_ON_ATOMIC ) {
			// The button turns actionable only once the widget script has initialised,
			// which nothing in the DOM reflects, so Playwright's own checks cannot see it.
			// The widgets also keep resizing until then, which would fail the scroll below.
			await waitForWPWidgetsIfNecessary( this.page );
		}

		await commentContent.scrollIntoViewIfNeeded( { timeout: likeWidgetTimeout } );

		if ( envVariables.TEST_ON_ATOMIC ) {
			const frame = commentContent.frameLocator( 'iframe[name^="like-comment-frame"]' );

			// Without `exact`, "Like" also matches "Liked by you".
			return {
				notLiked: frame.getByRole( 'link', { name: 'Like', exact: true } ),
				liked: frame.getByRole( 'link', { name: 'Liked by you' } ),
			};
		}

		return {
			notLiked: commentContent.locator( '.comment-not-liked > span:text-is("Like"):visible' ),
			liked: commentContent.locator( '.comment-liked:has-text("Liked by") > a' ),
		};
	}

	/**
	 * Likes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to like.
	 */
	async like( comment: string ): Promise< void > {
		const { notLiked, liked } = await this.likeLocators( comment );

		await notLiked.click( { timeout: likeWidgetTimeout } );
		await liked.waitFor( { timeout: likeWidgetTimeout } );
	}

	/**
	 * Unlikes a comment with given text.
	 *
	 * @param {string} comment Text of the comment to unlike.
	 */
	async unlike( comment: string ): Promise< void > {
		const { notLiked, liked } = await this.likeLocators( comment );

		await liked.click( { timeout: likeWidgetTimeout } );
		await notLiked.waitFor( { timeout: likeWidgetTimeout } );
	}
}
