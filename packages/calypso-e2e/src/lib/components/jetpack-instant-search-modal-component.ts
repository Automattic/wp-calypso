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
	 *
	 */
	get modalLocator(): Locator {
		return this.page.getByRole( 'dialog', { name: 'Search results' } );
	}

	/**
	 *
	 */
	get resultsListLocator(): Locator {
		// No good accessible differentiator for the ol element.
		return this.modalLocator.locator( '.jetpack-instant-search__search-results-list' );
	}

	/**
	 *
	 * @returns
	 */
	async getSearchTerm(): Promise< string > {
		// The name of this is messed up -- we're pulling in some icon text. So we do a partial match.
		const searchTermLocator = this.modalLocator.getByRole( 'searchbox', { name: /Search/ } );
		searchTermLocator.waitFor();
		return await searchTermLocator.inputValue();
	}

	/**
	 *
	 */
	async clearSearchTerm(): Promise< void > {
		await this.modalLocator.getByRole( 'button', { name: 'Clear' } ).click();
	}

	/**
	 *
	 */
	async expectAndWaitForSearch(): Promise< void > {
		// This is currently the safest and most reliable way to wait for a search action to complete.
		// Keying off of web requests is a bit squirrely because it's always the same route with a ton of different args.
		// The loading header is reliable, but it takes a quick moment to show up, allowing for a race condition.
		// Therefore, we take a wrapped approach. We wait for the loading header to show up, then wait for it to go away.
		// Then we wrap the search-triggering action in this promise.
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
	 *
	 * @returns
	 */
	async getNumberOfResults(): Promise< number > {
		return await this.resultsListLocator.getByRole( 'listitem' ).count();
	}

	/**
	 *
	 */
	async validateHighlightedMatch( text: string ): Promise< void > {
		return await this.resultsListLocator.locator( `mark:has-text("${ text }")` ).first().waitFor();
	}

	/**
	 *
	 * @returns
	 */
	async getNumberOfHighlightedMatches(): Promise< number > {
		return await this.resultsListLocator.locator( 'mark' ).count();
	}

	/** */
	async closeModal(): Promise< void > {
		await this.modalLocator.getByRole( 'button', { name: 'Close search results' } ).click();
		await this.modalLocator.waitFor( { state: 'detached' } );
	}
}
