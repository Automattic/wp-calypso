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
	constructor( page: Page ) {
		super( page, selectors.main );
	}

	async _postInit(): Promise< void > {
		await this.page.waitForLoadState( 'domcontentloaded' );
	}
}
