/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Frame, Page, ElementHandle } from 'playwright';

const selectors = {
	// Note the variation of 'Like' button for when the button is already clicked.
	likeWidget: 'iframe.post-likes-widget',

	// Selectors within the Like Widget iframe.
	likeButton: 'text=Like',
	likedButton: 'text=Liked',
	likedText: 'text="You like this."',
};

/**
 * Component representing the like component on a post/page.
 *
 * @augments {BaseContainer}
 */
export class LikesComponent extends BaseContainer {
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
		const handle = ( await this.page.$( selectors.likeWidget ) ) as ElementHandle;
		this.frame = ( await handle.contentFrame() ) as Frame;
		await this.page.waitForLoadState( 'networkidle' );
	}

	/**
	 * Clicks the Like button and toggles the state.
	 *
	 * This function will also confirm that click action on the Like button
	 * had the intended effect.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickLike(): Promise< void > {
		const isLiked = await this.frame.isVisible( selectors.likedText );

		// In subsequent statement this will be assigned an ElementHandler
		// of the Like/Liked button.
		let button;

		if ( isLiked ) {
			// Post is liked. Click to unlike.
			await this.frame.click( selectors.likedButton );
			button = await this.frame.waitForSelector( selectors.likeButton );
		} else {
			// Post is not yet liked. Click to like.
			await this.frame.click( selectors.likeButton );
			button = await this.frame.waitForSelector( selectors.likedButton );
		}

		await button.waitForElementState( 'stable' );
		await this.frame.waitForLoadState( 'networkidle' );
	}
}
