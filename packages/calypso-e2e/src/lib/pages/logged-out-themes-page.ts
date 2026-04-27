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
	 * After applying the filter, waits for the filter dropdown to close and
	 * for the theme grid to settle with at least one filtered theme card
	 * rendered, so subsequent interactions don't race with the rerender.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		const option = this.page.getByRole( 'option', { name: filter } );

		await this.page.getByRole( 'combobox', { name: 'View' } ).click();
		await option.click();

		// Wait for the option/listbox to be dismissed so the filter selection
		// has been committed before we look for cards.
		await option.waitFor( { state: 'hidden' } );

		// Wait for the theme grid to settle after the filter triggers a
		// refetch + rerender. A brief detach-then-reattach cycle is normal,
		// so we explicitly wait for a card to be visible (not just attached)
		// before allowing callers to click one.
		await this.firstThemeCard.waitFor( { state: 'visible' } );
	}
}
