/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	main: '#primary',
};

/**
 * Represents the Settings page.
 */
export class SettingsPage extends BaseContainer {
	/**
	 * Construct an instance of the SettingsPage.
	 *
	 * @param {Page} page Underlying page where interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.main );
	}

	/**
	 * Post-initialization checks.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
	}
}
