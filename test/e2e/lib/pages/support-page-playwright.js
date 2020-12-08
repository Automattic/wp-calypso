export default class SupportPage {
	constructor( page ) {
		// Selectors
		this.inlineHelpButtonSelector = '.inline-help__button';
		this.inlineHelpPopoverSelector = '.inline-help__popover';

		this.page = page;
	}

	async openInlineHelp() {
		let inlineHelpOpen = await this.inlineHelpPopoverVisible();
		// If the in-line help popover is not visible, let's click it.
		if ( inlineHelpOpen === false ) {
			await this.inlineHelpButtonVisible();
			// Found out via debugging that Inline Help popover does not immediately render in a lot of cases
			// because it is waiting for the following request to complete.
			// Waiting for this longest-running to complete turns out to be a good way to ensure
			// the presence of the popover.
			await Promise.all( [
				this.page.waitForResponse( 'https://public-api.wordpress.com/wpcom/v2/support-history**' ),
				this.page.click( this.inlineHelpButtonSelector ),
			] );
		}
		inlineHelpOpen = await this.inlineHelpPopoverVisible();
		return inlineHelpOpen === true;
	}

	async closeInlineHelp() {
		let inlineHelpOpen = await this.inlineHelpPopoverVisible();
		if ( inlineHelpOpen ) {
			await this.inlineHelpButtonVisible();
			await this.page.click( this.inlineHelpButtonSelector );
		}
		inlineHelpOpen = await this.inlineHelpPopoverVisible();
		return inlineHelpOpen === false;
	}

	async inlineHelpButtonVisible() {
		await this.page.waitForLoadState( 'networkidle' );
		const visible = await this.page.$( this.inlineHelpButtonSelector );
		return visible !== null;
	}

	async inlineHelpPopoverVisible() {
		const visible = await this.page.$( this.inlineHelpPopoverSelector );

		return visible !== null;
	}

	async getResults( selector ) {
		await this.page.waitForLoadState( 'networkidle' );
		await this.page.waitForSelector( selector );
		return await this.page.$$( selector );
	}

	async getDefaultResultCount() {
		const results = await this.getResults( '.inline-help__results-cell' );

		return results.length;
	}

	async getResultCount() {
		const results = await this.getResults( '[aria-labelledby="inline-search--api_help"]' );

		return results.length;
	}

	async searchForQuery( searchTerm ) {
		const page = this.page;
		const inlineHelpSearchInput = '.form-text-input.search__input';

		await this.openInlineHelp();

		await page.waitForSelector( this.inlineHelpPopoverSelector );
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
