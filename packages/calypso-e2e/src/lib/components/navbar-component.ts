/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	navbar: '.masterbar',
	publishButton: '.masterbar__publish',
	newPostButton: '.masterbar__item-new',
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
		super( page, selectors.navbar );
	}

	async __postInit(): Promise< void > {
		// Ensure that navigation is completed and the required
		// elements are visible on page.
		await this.page.waitForLoadState( 'domcontentloaded' );
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		// Series of promises that ensure editor page is loaded.
		await this.page.waitForSelector( selectors.newPostButton );
		await this.page.waitForSelector( selectors.publishButton );
		await Promise.race( [
			this.page.click( selectors.newPostButton ),
			this.page.click( selectors.publishButton ),
			this.page.click( 'text=Write' ),
		] );
		await this.page.waitForLoadState( 'networkidle' );
	}
}
