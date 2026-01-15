import { envVariables } from '../..';
import type { Page } from 'playwright';

/**
 * Component representing the a partner directory block.
 */
export class PartnerDirectoryComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Apply a dropdown filter to the partner directory.
	 *
	 * @param {string} dropdownName The name of the dropdown to apply the filter to.
	 * @param {string} filterName The name of the filter to apply.
	 */
	async applyDropdownFilter( dropdownName: string, filterName: string ): Promise< void > {
		// On mobile, we need to click the filters toggle button first to open the filters panel.
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// TODO: This button has no accessible name, so we have to use a CSS selector.
			const filtersToggle = this.page.locator( '.a4a-partner-directory-filters-toggle' );
			await filtersToggle.waitFor( { state: 'visible' } );
			await filtersToggle.click();
		}
		await this.page.getByRole( 'button', { name: dropdownName } ).click();
		await this.page.getByRole( 'checkbox', { name: filterName } ).click();
	}

	/**
	 * Wait for the filter to be applied.
	 */
	async waitForFilterToBeApplied(): Promise< void > {
		await this.page.waitForSelector( 'text=/\\d+ partners found for filters/', {
			timeout: 10000,
		} );
	}

	/**
	 * Click the first partner in the partner directory.
	 */
	async clickFirstPartner(): Promise< void > {
		const partner = this.page.getByRole( 'link', { name: 'Accepting new clients' } ).first();

		await partner.click();
	}
}
