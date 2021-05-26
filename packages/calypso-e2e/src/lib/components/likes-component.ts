/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Frame, Page, ElementHandle } from 'playwright';

/**
 * Component representing the like component on a post/page.
 *
 * @augments {BaseContainer}
 */
export class LikesComponent extends BaseContainer {
	frame!: Frame;

	// Selectors for the widget and buttons.
	// Note the variation of 'Like'.
	likeWidgetSelector = 'iframe.post-likes-widget';
	likeButtonSelector = 'text=Like';
	likedButtonSelector = 'text=Liked';

	/**
	 * Constructs an instance of the object.
	 *
	 * @param {Page} page Instance of the page on which the component resides.
	 */
	constructor( page: Page ) {
		super( page, 'iframe.post-likes-widget' );
	}

	/**
	 * Overrides the parent method for post-initialization steps.
	 * This ensures the iframe is enabled and interactable.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		const handle = ( await this.page.$( this.likeWidgetSelector ) ) as ElementHandle;
		this.frame = ( await handle.contentFrame() ) as Frame;
	}

	/**
	 * Clicks and toggles the state of the Like button.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickLike(): Promise< void > {
		await Promise.race(
			[ 'text=Like', 'text=Liked' ].map( ( selector ) => this.frame.click( selector ) )
		);
	}
}
