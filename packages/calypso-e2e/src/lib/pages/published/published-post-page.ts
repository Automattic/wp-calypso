/**
 * Internal dependencies
 */
import { BaseContainer } from '../../base-container';

/**
 * Type dependencies
 */
import { Page, Frame, ElementHandle } from 'playwright';

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
	/**
	 * Constructs an instance of the PublishedPostPage.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.page );
	}

	/**
	 * Nested inner class representing the post's Likes component.
	 */
	private PostLikesComponent = class extends BaseContainer {
		frame!: Frame;

		/**
		 * Constructs an instance of the object.
		 *
		 * @param {Page} page Instance of the page on which the component resides.
		 */
		constructor( page: Page ) {
			super( page, selectors.likeWidget );
		}

		/**
		 * Overrides the parent method for post-initialization steps.
		 * This ensures the iframe is enabled and interactable.
		 *
		 * @returns {Promise<void>} No return value.
		 */
		async _postInit(): Promise< void > {
			// Obtain the ElementHandle for the widget containing the like/unlike button.
			const handle = ( await this.page.$( selectors.likeWidget ) ) as ElementHandle;
			// Obtain the Frame object from the ElementHandle. This represents the widget iframe.
			this.frame = ( await handle.contentFrame() ) as Frame;
			// Wait until the widget element is stable in the DOM.
			await handle.waitForElementState( 'stable' );
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
			await button.click();
		}
	};

	/**
	 * Clicks the Like button on the post.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async likePost(): Promise< void > {
		const postLikesComponent = await this.PostLikesComponent.Expect( this.page );
		await postLikesComponent._click( selectors.likeButton );
		await postLikesComponent.frame.waitForSelector( selectors.likedText, { state: 'visible' } );
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
		const postLikesComponent = await this.PostLikesComponent.Expect( this.page );
		await postLikesComponent._click( selectors.unlikeButton );
		await postLikesComponent.frame.waitForSelector( selectors.notLikedText, { state: 'visible' } );
	}
}
