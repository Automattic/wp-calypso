/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

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
		super( page );
	}
}
