import { Page } from 'playwright';

/**
 * Represents the Settings page.
 */
export class SettingsPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}
}
