import { Locator, Page } from 'playwright';

const selectors = {
	// Components
	supportPopoverButton: ( { isActive }: { isActive?: boolean } = {} ) =>
		`button[title="Help"]${ isActive ? '.is-active' : '' }`,
	closeButton: '[aria-label="Close Help Center"]',

	// Results
	resultsPlaceholder: '.help-center-loading',
};

/**
 * Represents the Support popover available on most WPCOM screens.
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
		this.helpCenter = this.page.getByLabel( 'Help Center' );
	}

	/**
	 * Opens the support popover from the closed state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openPopover(): Promise< void > {
		if ( await this.page.isVisible( selectors.supportPopoverButton( { isActive: true } ) ) ) {
			return;
		}

		await Promise.all( [
			this.page.waitForSelector( selectors.supportPopoverButton() ),
			this.page.click( selectors.supportPopoverButton() ),
		] );

		await this.page.waitForSelector( selectors.supportPopoverButton( { isActive: true } ) );
	}

	/**
	 * Closes the support popover from the open state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closePopover(): Promise< void > {
		if ( await this.page.isHidden( selectors.closeButton ) ) {
			return;
		}
		await this.page.click( selectors.closeButton );
		await this.page.waitForSelector( selectors.closeButton, { state: 'hidden' } );
	}

	/* Results */

	/**
	 * Returns the numnber of results found under each cateogry.
	 *
	 * If the category has no results (eg. Show Me Where has no results)
	 * then the value 0 is returned.
	 *
	 * @returns {Promise<[number, number]>} Array of numbers.
	 */
	async getResultCount(): Promise< [ number, number ] > {
		return [
			await this.page
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Recommended resources' } )
				.count(),
			await this.page
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Show me where to' } )
				.count(),
		];
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

		await Promise.all( [
			this.page.waitForResponse( /wpcom\?query/ ),
			this.page.locator( selectors.resultsPlaceholder ).waitFor( { state: 'hidden' } ),
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
