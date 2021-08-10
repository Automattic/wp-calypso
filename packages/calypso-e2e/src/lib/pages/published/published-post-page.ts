import { Frame, Page } from 'playwright';

const selectors = {
	// Post body
	postBody: '.entry-content',

	// Like Widget
	likeWidget: 'iframe[title="Like or Reblog"]',
	likeButton: 'a.like',
	unlikeButton: 'a.liked',
	likedText: 'text=Liked',
	notLikedText: 'text=Like',
};

/**
 * Represents the published site's post listings page.
 */
export class PublishedPostPage {
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
	 * Returns the frame which holds the Like widget.
	 *
	 * @returns {Promise<Frame>} Frame holding the like widget on page.
	 */
	private async getFrame(): Promise< Frame > {
		// Obtain the ElementHandle for the widget containing the like/unlike button.
		const elementHandle = await this.page.waitForSelector( selectors.likeWidget );
		// Obtain the Frame object from the elementHandleHandle. This represents the widget iframe.
		const frame = ( await elementHandle.contentFrame() ) as Frame;
		// Wait until the widget element is stable in the DOM.
		await elementHandle.waitForElementState( 'stable' );

		return frame;
	}

	/**
	 * Clicks the Like button on the post.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async likePost(): Promise< void > {
		const frame = await this.getFrame();
		await frame.click( selectors.likeButton );
		await frame.waitForSelector( selectors.likedText, { state: 'visible' } );
	}

	/**
	 * Clicks the already-liked Like button on the post to unlike.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async unlikePost(): Promise< void > {
		const frame = await this.getFrame();
		await frame.click( selectors.unlikeButton );
		await frame.waitForSelector( selectors.notLikedText, { state: 'visible' } );
	}
}
