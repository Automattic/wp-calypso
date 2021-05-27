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

		// Build the list of promises to be resolved at end.
		const promises: any = [
			// Clicking the Like triggers an navigation event.
			// Wait for this event to complete, as the response typically takes
			// ~1.5s.
			this.frame.waitForLoadState( 'networkidle' ),
		];

		if ( isLiked ) {
			// Like button is already clicked. Check for unlike status at end.
			promises.push( this.frame.waitForSelector( selectors.likeButton ) );
			promises.push( this.frame.click( selectors.likedButton ) );
		} else {
			promises.push( this.frame.waitForSelector( selectors.likedButton ) );
			promises.push( this.frame.click( selectors.likeButton ) );
		}

		await Promise.all( promises );
	}
}
