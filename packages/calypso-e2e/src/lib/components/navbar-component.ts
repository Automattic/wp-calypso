/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	navBarSelector: '.masterbar',
	newPostButtonSelector: '.masterbar__item-new',
	newPostContentSelector: '.masterbar__item-content',
};
/**
 * Component representing the navbar/masterbar at top of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class NavbarComponent extends BaseContainer {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page, selectors.navBarSelector );
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await Promise.all( [
			this.page.isVisible( selectors.navBarSelector ),
			this.page.isVisible( selectors.newPostButtonSelector ),
			this.page.waitForNavigation(),
		] );

		// Note the nested Promise calls.
		// Originally there were issues on TeamCity CI where
		// this would fail to locate the newPostButtonSelector.
		// The newPostContentSelector is clicked for redundancy.
		await Promise.all( [
			Promise.race( [
				this.page.click( selectors.newPostButtonSelector ),
				this.page.click( selectors.newPostContentSelector ),
			] ),
			this.page.waitForNavigation(),
		] );
	}
}
