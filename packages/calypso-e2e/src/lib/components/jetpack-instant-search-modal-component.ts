import { Locator, Page } from 'playwright';

/**
 * Component representing the modal popup for Jetpack Instant Search.
 */
export class JetpackInstantSearchModalComponent {
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
	 * A locator to the parent modal dialog.
	 */
	get modalLocator(): Locator {
		return this.page.getByRole( 'dialog', { name: 'Search results' } );
	}

	/**
	 * A locator to the parent element for the list of search results.
	 */
	get resultsListLocator(): Locator {
		// No good accessible differentiator for the ol element, so we need CSS.
		return this.modalLocator.locator( '.jetpack-instant-search__search-results-list' );
	}

	/**
	 * Gets the current value of the search input field.
	 *
	 * @returns {Promise<string>} The current value of the search input field.
	 */
	async getSearchTerm(): Promise< string > {
		// The name of this is messed up -- we're pulling in some icon text. So we do a partial name RegEx match.
		const searchTermLocator = this.modalLocator.getByRole( 'searchbox', { name: /Search/ } );
		await searchTermLocator.waitFor();
		return await searchTermLocator.inputValue();
	}

	/**
	 * Clears the search input field using the Clear button.
	 */
	async clearSearchTerm(): Promise< void > {
		await this.modalLocator.getByRole( 'button', { name: 'Clear' } ).click();
	}

	/**
	 * Waits for a search to start and complete by keying off of DOM changes.
	 * This should wrap other actions that trigger a search.
	 * E.g.:
	 *
	 * await Promise.all( [
	 *  searchModalComponent.expectAndWaitForSearch(),
	 *  <some action that triggers a search>(),
	 * ] );
	 */
	async expectAndWaitForSearch( search: string ): Promise< void > {
		// This is currently the safest and most reliable way to wait for a search action to complete.
		// First, we wait for the web response unique to the search query to come back.
		// That way, we can THEN safely wait for the headers that indicate that the UI has re-rendered.
		await this.page.waitForResponse( ( response ) => {
			// Yes, the component is double-encoding the search term!
			const expectedQuery = `query=${ encodeURIComponent( encodeURIComponent( search ) ) }`;
			return response.url().includes( '/search' ) && response.url().includes( expectedQuery );
		} );

		// There are two different headers based on whether results were found or not.
		const withResultsLocator = this.modalLocator.getByRole( 'heading', {
			name: 'Showing popular results',
		} );
		const withoutResultsLocator = this.modalLocator.getByRole( 'heading', {
			name: 'No results found',
		} );
		await Promise.race( [ withResultsLocator.waitFor(), withoutResultsLocator.waitFor() ] );
	}

	/**
	 * Gets the number of search results items.
	 *
	 * @returns {Promise<number>} The number of search results items.
	 */
	async getNumberOfResults(): Promise< number > {
		return await this.resultsListLocator.getByRole( 'listitem' ).count();
	}

	/**
	 * Validates that there is a highlighted match with given text in the search results.
	 *
	 * @throws If no highlted match is found.
	 */
	async validateHighlightedMatch( text: string ): Promise< void > {
		return await this.resultsListLocator
			.locator( 'mark' )
			.filter( { hasText: text } )
			.first()
			.waitFor();
	}

	/**
	 * Gets the number of highlighted matches in the search results. Useful for validating
	 * that there are no highlighted matches.
	 *
	 * @returns {Promise<number>} The number of highlighted matches in the search results.
	 */
	async getNumberOfHighlightedMatches(): Promise< number > {
		return await this.resultsListLocator.locator( 'mark' ).count();
	}

	/**
	 * Closes the modal and validates that it actually goes away.
	 */
	async closeModal(): Promise< void > {
		await this.modalLocator.getByRole( 'button', { name: 'Close search results' } ).click();
		await this.modalLocator.waitFor( { state: 'detached' } );
	}
}
