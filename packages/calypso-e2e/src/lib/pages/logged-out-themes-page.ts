import { Locator, Page } from 'playwright';

/**
 * Represents the logged-out themes showcase page.
 */
export class LoggedOutThemesPage {
	private page: Page;
	readonly firstThemeCard: Locator;
	private readonly firstThemeCardContainer: Locator;
	private readonly themePlaceholders: Locator;

	/**
	 * Constructs an instance of the logged-out themes showcase page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.firstThemeCardContainer = this.page.locator( '[data-e2e-theme]' ).first();
		this.firstThemeCard = this.firstThemeCardContainer.locator( '.theme-card__image' );
		this.themePlaceholders = this.page.locator( '.themes-list .is-placeholder' );
	}

	/**
	 * Waits for the currently visible theme list to finish updating.
	 *
	 * The showcase keeps previous results rendered while a new filter request is in flight,
	 * so we wait for placeholder cards to disappear before clicking a theme.
	 */
	private async waitForThemeResultsToSettle(): Promise< void > {
		await this.firstThemeCardContainer.waitFor( { state: 'visible', timeout: 30_000 } );

		const firstPlaceholder = this.themePlaceholders.first();
		try {
			await firstPlaceholder.waitFor( { state: 'visible', timeout: 2_000 } );
			await firstPlaceholder.waitFor( { state: 'hidden', timeout: 30_000 } );
		} catch {
			// If placeholders never appear, the results were already settled.
		}

		await this.firstThemeCard.waitFor( { state: 'visible', timeout: 30_000 } );
	}

	/**
	 * Opens the first theme currently shown in the showcase.
	 */
	async selectFirstThemeCard(): Promise< void > {
		await this.waitForThemeResultsToSettle();
		await this.firstThemeCard.scrollIntoViewIfNeeded();
		await Promise.all( [
			this.page.waitForURL( /\/theme\//, { timeout: 30_000 } ),
			this.firstThemeCard.click(),
		] );
	}

	/**
	 * Filters the themes by the given filter.
	 *
	 * @param {string} filter - The filter to apply.
	 */
	async filterBy( filter: string ) {
		const currentUrl = this.page.url();
		await this.page.getByRole( 'combobox', { name: 'Filters' } ).click();
		await Promise.all( [
			this.page
				.waitForURL( ( url ) => url.toString() !== currentUrl, { timeout: 30_000 } )
				.catch( () => null ),
			this.page.getByRole( 'option', { name: filter } ).click(),
		] );
		await this.waitForThemeResultsToSettle();
	}
}
