import { Frame } from 'playwright';
import { BaseContainer } from '../../base-container';

const selectors = {
	// Like Widget
	likeWidget: 'iframe.post-likes-widget',
	likeButton: 'a.like',
	unlikeButton: 'a.liked',
	likedText: 'text=Liked',
	notLikedText: 'text=Like',
};

/**
 * Represents the published site's post listings page.
 *
 * @augments {BaseContainer}
 */
export class PublishedPostPage extends BaseContainer {
	frame!: Frame;

	/**
	 * Performs the click action on the post's like button.
	 *
	 * This helper method does not check whether the button state has changed.
	 * To ensure the state changed to the expected value, the caller should perform additional
	 * checks.
	 *
	 * @param {string} selector Element to click on the frame.
	 * @returns {Promise<void>} No return value.
	 */
	async _click( selector: string ): Promise< void > {
		if ( ! this.frame ) {
			// Obtain the ElementHandle for the widget containing the like/unlike button.
			const elementHandle = await this.page.waitForSelector( selectors.likeWidget );
			// Obtain the Frame object from the elementHandleHandle. This represents the widget iframe.
			this.frame = ( await elementHandle.contentFrame() ) as Frame;
			// Wait until the widget element is stable in the DOM.
			await elementHandle.waitForElementState( 'stable' );
		}

		const button = await this.frame.waitForSelector( selector );
		await button.click();
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
		await this._click( selectors.likeButton );
		await this.frame.waitForSelector( selectors.likedText, { state: 'visible' } );
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
		await this._click( selectors.unlikeButton );
		await this.frame.waitForSelector( selectors.notLikedText, { state: 'visible' } );
	}
}
