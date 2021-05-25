/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

/**
 * Component representing the navbar/masterbar at top of WPCOM.
 */
export class NavbarComponent extends BaseContainer {
	// Selectors
	barSelector = '.masterbar';
	newPostSelector = 'a.masterbar__item-new';

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page, '.masterbar' );
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await this.page.click( this.newPostSelector );
		await Promise.all( [ this.page.waitForNavigation() ] );
	}
}
