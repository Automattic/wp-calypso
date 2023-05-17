import { Locator, Page } from 'playwright';

/**
 * Represents the Inline Help popover.
 */
export class SupportComponent {
	private page: Page;
	private helpCenter: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.helpCenter = this.page.locator( '.components-card__body > .inline-help__search' );
	}

	/**
	 * Opens the support popover from the closed state.
	 */
	async openPopover(): Promise< void > {
		const helpButton = this.page
			.getByRole( 'banner' )
			.getByRole( 'button', { name: 'Help', exact: true } );

		// The `isVisible` API is deprecated becaues it returns immediately,
		// so it is not recommended here.
		if ( await this.helpCenter.count() ) {
			return;
		}

		await helpButton.click();
		await this.helpCenter.waitFor( { state: 'visible' } );
	}

	/**
	 * Closes the support popover from the open state.
	 */
	async closePopover(): Promise< void > {
		const helpButton = this.page
			.getByRole( 'banner' )
			.getByRole( 'button', { name: 'Help', exact: true } );

		// The `isVisible` API is deprecated becaues it returns immediately,
		// so it is not recommended here.
		if ( ! ( await this.helpCenter.count() ) ) {
			return;
		}

		await helpButton.click();
		await this.helpCenter.waitFor( { state: 'detached' } );
	}

	/* Results */

	/**
	 * Returns the numnber of results found under each cateogry.
	 *
	 * If the category has no results (eg. Show Me Where has no results)
	 * then the value 0 is returned.
	 *
	 * @returns {Promise<{articleCount: number, linkCount: number}>} Object with named values.
	 */
	async getResultCount(): Promise< { articleCount: number; linkCount: number } > {
		return {
			articleCount: await this.page
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Recommended resources' } )
				.count(),
			linkCount: await this.page
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Show me where to' } )
				.count(),
		};
	}

	/**
	 * Clicks on the first result that partially matches the text.
	 *
	 * @param {string} text Text to match on the results.
	 */
	async clickResult( text: string ): Promise< void > {
		await this.helpCenter
			.getByRole( 'list', { name: /(Recommended resources|Show me where)/ } )
			.getByRole( 'link', { name: text } )
			.first()
			.click();
	}

	/* Search input */

	/**
	 * Fills the support popover search input and waits for the query to complete.
	 *
	 * @param {string} text Search keyword to be entered into the search field.
	 */
	async search( text: string ): Promise< void > {
		await this.helpCenter.getByPlaceholder( 'Search for help' ).fill( text );

		// Wait on two factors in the inline help popover:
		//	- the query to the search endpoint;
		//	- the placeholder elements in the search results.
		await Promise.all( [
			// @example https://public-api.wordpress.com/wpcom/v2/help/search/wpcom?query=themes
			this.page.waitForResponse( /wpcom\?query/ ),
			this.page.locator( '.help-center-loading' ).waitFor( { state: 'hidden' } ),
		] );
	}

	/**
	 * Clears the search field of all keywords.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clearSearch(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Close Search' } ).click();
	}
}
