import { Frame, Page } from 'playwright';

const selectors = {
	// Post body
	postBody: '.entry-content',
	postPasswordInput: 'input[name="post_password"]',
	submitPasswordButton: 'input[name="Submit"]',

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
	 * Fills and submits the post password for password protected entries.
	 *
	 * @param {string} password Password to submit.
	 */
	async enterPostPassword( password: string ): Promise< void > {
		await this.page.fill( selectors.postPasswordInput, password );
		await Promise.all( [ this.page.waitForNavigation(), this.page.keyboard.press( 'Enter' ) ] );
	}

	/**
	 * Returns the frame which holds the Like widget.
	 *
	 * @returns {Promise<Frame>} Frame holding the like widget on page.
	 */
	private async getLikeFrame(): Promise< Frame > {
		// Obtain the ElementHandle for the widget containing the like/unlike button.
		const elementHandle = await this.page.waitForSelector( selectors.likeWidget );
		// Without the next line, headless viewports fail to locate the Like widget.
		await elementHandle.scrollIntoViewIfNeeded();
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
		const frame = await this.getLikeFrame();
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
		const frame = await this.getLikeFrame();
		await frame.click( selectors.unlikeButton );
		await frame.waitForSelector( selectors.notLikedText, { state: 'visible' } );
	}

	/**
	 * Validates that the provided text can be found in the post page. Throws if it isn't.
	 *
	 * @param {string} text Text to search for in post page
	 */
	async validateTextInPost( text: string ): Promise< void > {
		// Oddly, if the selector is replaced with :text():visible,
		// it produces a BADSTRING error.
		await this.page.waitForSelector( `text=${ text } >> visible=true` );
	}
}
