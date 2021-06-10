/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page, ElementHandle } from 'playwright';

const selectors = {
	topLevelComments: '.comment-list .depth-1:not(.children)',
	likeButton: '.comment-like-link',
	notLiked: '.comment-not-liked',
	liked: '.comment-liked',
};

/**
 * Component representing the like component of a comment.
 *
 * @augments {BaseContainer}
 */
export class CommentsLikesComponent extends BaseContainer {
	/**
	 * Constructs an instance of the object.
	 *
	 * @param {Page} page Instance of the page on which the component resides.
	 */
	constructor( page: Page ) {
		super( page, selectors.topLevelComments );
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
	 * Clicks the Like button and toggles the state.
	 *
	 * This function will also confirm that click action on the Like button
	 * had the intended effect.
	 *
	 * @param {number} commentNum The nth comment to click like on. Defaults to 1.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If no comments exist.
	 */
	async clickLikeComment( commentNum = 1 ): Promise< void > {
		await this.page.waitForSelector( selectors.topLevelComments );

		// For now, only works with top level comments since child comments introduce
		// a whole new layer of complexity.
		const topLevelComments = await this.page.$$( selectors.topLevelComments );

		if ( commentNum > topLevelComments.length ) {
			throw new Error(
				`Post has comment count of ${ topLevelComments.length }, was asked to like comment number ${ commentNum }`
			);
		}

		// Get the nth top-level comment, which is the target to have the like button toggled.
		// Check whether the CSS class for the post having been 'liked' exists.
		const comment = topLevelComments[ commentNum - 1 ];
		const isLiked = await comment.$( selectors.liked );
		const likeButton = ( await comment.$( selectors.likeButton ) ) as ElementHandle;

		// Click the like button and attempt to wait until the animations and such are done.
		await Promise.all( [ likeButton.click(), likeButton.waitForElementState( 'enabled' ) ] );

		// Check for intended outcome depending on the original liked state.
		if ( await isLiked?.isVisible() ) {
			await comment.waitForSelector( selectors.notLiked );
		} else {
			await comment.waitForSelector( selectors.liked );
		}
	}
}
