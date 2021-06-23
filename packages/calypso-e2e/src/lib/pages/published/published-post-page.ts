/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { BaseContainer } from '../../base-container';

/**
 * Type dependencies
 */
import { Page, Frame, ElementHandle } from 'playwright';

const selectors = {
	// Like Widget
	likeWidgetWrapper: '.sharedaddy .sd-block',
	likeWidget: 'iframe.post-likes-widget',
	likeButton: '.sd-button',
	likedText: 'a span:text("Liked")',
	notLikedText: 'a span:text("Like")',
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
		super( page );
	}

	/**
	 * Overrides the parent method for post-initialization steps.
	 * This ensures the ifram e is enabled and interactable.
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
	async _click( selector: string ): Promise< ElementHandle > {
		const button = await this.frame.waitForSelector( selector );
		await button.click();
		await button.waitForElementState( 'enabled' );
		return button;
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
		const attributes = await this.frame.getAttribute( selectors.likeButton, 'class' );
		const isLiked = attributes?.includes( 'liked' );
		assert.strictEqual( isLiked, true );
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
		await this._click( selectors.likeButton );
		await this.frame.waitForSelector( selectors.notLikedText, { state: 'visible' } );
		const attributes = await this.frame.getAttribute( selectors.likeButton, 'class' );
		const isNotLiked = ! attributes?.includes( 'liked' );
		assert.strictEqual( isNotLiked, true );
	}
}
