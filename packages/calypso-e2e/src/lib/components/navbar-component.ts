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
	newPostButton: '.masterbar__item-new',
	mySiteButton: 'text=My Site',
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

	/**
	 * Locates and clicks on the selector once the element is stable.
	 *
	 * @param {string} selector String selector.
	 */
	async _click( selector: string ): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selector );
		await elementHandle.click();
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await this._click( selectors.newPostButton );
	}

	/**
	 * Clicks on `My Sites` on the top left of WPCOM dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMySites(): Promise< void > {
		await this._click( selectors.mySiteButton );
	}
}
