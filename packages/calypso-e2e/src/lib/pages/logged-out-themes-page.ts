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
	 * Waits for the theme grid to re-render with at least one card attached
	 * and visible after the filter is applied, so callers can safely interact
	 * with `firstThemeCard` without racing the re-render.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		await this.page.getByRole( 'combobox', { name: 'View' } ).click();
		await this.page.getByRole( 'option', { name: filter } ).click();

		// The theme grid re-renders asynchronously after the filter selection.
		// Wait for the first theme card to be attached and visible before
		// returning so subsequent clicks don't race the re-render.
		await this.firstThemeCard.waitFor( { state: 'visible', timeout: 30_000 } );
	}
}
