import { Locator, Page } from 'playwright';

/**
 * Represents the logged-out themes showcase page.
 */
export class LoggedOutThemesPage {
	private page: Page;
	readonly firstThemeCard: Locator;

	/**
	 * Constructs an instance of the logged-out themes showcase page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.firstThemeCard = this.page.locator( '[data-e2e-theme]' ).first();
	}

	/**
	 * Filters the themes by the given filter.
	 *
	 * Selecting a tier triggers a client-side navigation that re-renders the showcase.
	 * Wait for cards to settle after that transition so callers can click them safely.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		await this.page.getByRole( 'combobox', { name: 'View' } ).click();
		await this.page.getByRole( 'option', { name: filter } ).click();
		await this.firstThemeCard.waitFor( { state: 'visible', timeout: 30_000 } );
	}
}
