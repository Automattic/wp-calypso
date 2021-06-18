/**
 * Internal dependencies
 */
import { BaseContainer } from '../../base-container';

/**
 * Type dependencies
 */
import { Page, Frame } from 'playwright';

const selectors = {
	page: '#main',

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
	 * Constructs an instance of the PublishedPostPage.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.page );
	}

	/**
	 * Overrides the parent method for post-initialization steps.
	 * This ensures the iframe is enabled and interactable.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		// Obtain the ElementHandle for the widget containing the like/unlike button.
		const element = await this.page.waitForSelector( selectors.likeWidget );
		// Obtain the Frame object from the ElementHandle. This represents the widget iframe.
		this.frame = ( await element.contentFrame() ) as Frame;
		// Wait until the widget element is stable in the DOM.
		await element.waitForElementState( 'stable' );
	}

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
		const button = await this.frame.waitForSelector( selector );
		await button.waitForElementState( 'stable' );
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
