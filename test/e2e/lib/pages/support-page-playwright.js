export default class SupportPage {
	constructor( page ) {
		// Selectors
		this.inlineHelpButton = '.inline-help__button';
		this.inlineHelpPopover = '.inline-help__popover';

		this.page = page;
	}

	async openInlineHelp() {
		const inlineHelpOpen = await this.inlineHelpPopoverVisible();
		// If the in-line help popover is not visible, let's click it.
		if ( ! inlineHelpOpen ) {
			await this.inlineHelpButtonVisible();
			await this.page.click( this.inlineHelpButton );
			return await this.inlineHelpPopoverVisible();
		}
	}

	async closeInlineHelp() {
		const inlineHelpOpen = await this.inlineHelpPopoverVisible();
		if ( inlineHelpOpen ) {
			await this.inlineHelpButtonVisible();
			return await this.page.click( this.inlineHelpButton );
		}
	}

	async inlineHelpButtonVisible() {
		await this.page.waitForLoadState( 'networkidle' );
		const visible = await this.page.$( this.inlineHelpButton );
		return visible !== null;
	}

	async inlineHelpPopoverVisible() {
		await this.page.waitForLoadState( 'networkidle' );
		const visible = await this.page.$( this.inlineHelpPopover );
		return visible !== null;
	}

	async getDefaultResults() {
		const defaultResultsSelector = '.inline-help__results-cell';

		return this.page.$$( defaultResultsSelector );
	}

	async getDefaultResultCount() {
		const results = await this.getDefaultResults();

		return results.length;
	}

	async getResults() {
		const searchResults = '[aria-labelledby="inline-search--api_help"]';

		return await this.page.$$( searchResults );
	}

	async getResultCount() {
		const results = await this.getResults();

		return results.length;
	}

	async searchForQuery( searchTerm ) {
		const page = this.page;
		const inlineHelpSearchInput = '.form-text-input.search__input';

		await this.openInlineHelp();

		await page.waitForSelector( this.inlineHelpPopover );
		await page.waitForSelector( inlineHelpSearchInput );

		if ( searchTerm.trim() === '' ) {
			// An otherwise empty search query won't trigger a HTTP GET request.
			// This clause will catch this specific condition so that the waitForResponse call does not
			// hang forever.
			return await page.waitForLoadState( 'domcontentloaded' );
		}
		// For a test scenario where a valid search query is given, the most reliable way that works
		// is to check for the HTTP 200 response of the GET request against the search API and resolve
		// the promise once all requests are complete.
		return await Promise.all( [
			page.waitForResponse( 'https://public-api.wordpress.com/rest/v1.1/help/search**' ),
			page.fill( inlineHelpSearchInput, searchTerm ),
		] );
	}

	async clearSearchField() {
		const inlineHelpSearchInput = '.form-text-input.search__input';

		// With Playwright, clearing the search field is as easy as filling it with empty string.
		return await this.page.fill( inlineHelpSearchInput, '' );
	}

	async searchReturnedNoResultsMessage() {
		const noResultsMessageSelector = '.inline-help__empty-results';

		// As per documentation, returns a null if no element with such selector is found.
		// Therefore if the returned value is not null, the element in question has been found.
		const noResults = await this.page.$( noResultsMessageSelector );
		return noResults !== null;
	}
}
