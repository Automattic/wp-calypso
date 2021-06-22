/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	container: '.masterbar',
	writeButton: '*css=a >> text=Write',
};
/**
 * Component representing the Masterbar header at top of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class MasterbarComponent extends BaseContainer {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page, selectors.container );
	}

	/**
	 * Locates and clicks on the "Write" button.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickWriteButton(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.writeButton ),
		] );
	}
}
