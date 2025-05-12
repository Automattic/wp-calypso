import { Page } from 'playwright';

/**
 * Represents the logged-out themes showcase page.
 */
export class LoggedOutThemesPage {
	private page: Page;

	/**
	 * Constructs an instance of the logged-out themes showcase page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Filters the themes by the given filter.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		await this.page.getByRole( 'button', { name: 'View: All' } ).click();
		await this.page.getByRole( 'menuitem', { name: filter } ).click();
	}

	/**
	 * Selects the first theme on the page.
	 */
	async clickFirstTheme() {
		await Promise.all( [
			this.page.locator( '[data-e2e-theme]' ).first().click(),
			this.page.waitForNavigation( { waitUntil: 'load' } ),
		] );
	}
}
