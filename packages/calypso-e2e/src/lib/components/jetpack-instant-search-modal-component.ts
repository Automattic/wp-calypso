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
	async expectAndWaitForSearch(): Promise< void > {
		// This is currently the safest and most reliable way to wait for a search action to complete.
		// Keying off of web requests is a bit squirrely because it's always the same route with a ton of different args.
		// The loading header is reliable, but it takes a quick moment to show up, allowing for a race condition.
		// Therefore, we take a wrapped approach. We wait for the loading header to show up, then wait for it to go away.
		// Then we wrap the search-triggering action in this promise.
		// Also, the header text changes depending on whether there's a search term or not.
		const withTermLocator = this.modalLocator.getByRole( 'heading', {
			name: 'Searching…',
			includeHidden: true, // these are aria-hidden while search is underway
		} );
		const withoutTermLocator = this.modalLocator.getByRole( 'heading', {
			name: 'Loading popular results…',
			includeHidden: true, // these are aria-hidden while search is underway
		} );
		await Promise.race( [ withTermLocator.waitFor(), withoutTermLocator.waitFor() ] );
		await Promise.all( [
			withTermLocator.waitFor( { state: 'detached', timeout: 20 * 1000 } ),
			withoutTermLocator.waitFor( { state: 'detached', timeout: 20 * 1000 } ),
		] );
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
