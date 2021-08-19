import assert from 'assert';
import { ElementHandle, Page } from 'playwright';

const selectors = {
	// Components
	supportButton: '.inline-help__button',
	supportPopover: '.inline-help__popover',
	searchInput: '[aria-label="Search"]',
	spinner: '.spinner',
	placeholder: '.inline-help__results-placeholder-item',
	clearSearch: '[aria-label="Close Search"]',
	supportCard: '.card.help-search',

	// Results
	resultsPlaceholder: '.inline-help__results-placeholder-item',
	resultsList: '.inline-help__results',
	results: '.inline-help__results-item',

	// Result types
	supportItems: '[aria-labelledby="inline-search--api_help"] li',
	adminItems: '[aria-labelledby="inline-search--admin_section"] li',
	emptyResults:
		'text="Sorry, there were no matches. Here are some of the most searched for help pages for this section:"',

	// Article
	readMoreButton: 'text=Read more',
	visitArticleButton: 'text="Visit article"',
	closeButton: 'button:text("Close")',
};

/**
 * Represents the Support popover available on most WPCOM screens.
 */
export class SupportComponent {
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
	 * Click on the support button (?).
	 * This method will toggle the status of the support popover.
	 * If the support popover is closed, it will be opened.
	 * If the support popover is open, it will be closed.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickSupportButton(): Promise< void > {
		const isPopoverOpen = await this.page.isVisible( selectors.supportPopover );

		if ( isPopoverOpen ) {
			await this.closePopover();
		} else {
			await this.openPopover();
		}
	}

	/**
	 * Opens the support popover from the closed state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openPopover(): Promise< void > {
		await this.page.click( selectors.supportButton );
		await this.page.waitForSelector( selectors.supportPopover, { state: 'visible' } );
	}

	/**
	 * Closes the support popover from the open state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closePopover(): Promise< void > {
		await this.page.click( selectors.supportButton );
		await this.page.waitForSelector( selectors.supportPopover, { state: 'hidden' } );
	}

	/**
	 * Wait for and scroll to expose the Support card, present only on My Home.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async showSupportCard(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.supportCard );
		await elementHandle.waitForElementState( 'stable' );
		await elementHandle.scrollIntoViewIfNeeded();
	}

	/* Result methods */

	/**
	 * Given a selector, returns an array of ElementHandles that match the given selector.
	 * Prior to selecing the elements, this method will wait for the 'domcontentloaded' event
	 * to be fired.
	 *
	 * @param {string} selector Selector on page to look for.
	 * @returns {Promise<ElementHandle[]>} Array of ElementHandles that match the given selector.
	 */
	async getResults( selector: string ): Promise< ElementHandle[] > {
		await this.page.waitForLoadState( 'domcontentloaded' );
		return await this.page.$$( selector );
	}

	/* Returns the overall number of results, not distinguishing the support & admin results. */

	/**
	 * Returns an array of ElementHandles that reference support entries regardless of its
	 * classification on page (admin links, support articles, suggestions).
	 *
	 * @returns {Promise<ElementHandle[]>} Array of ElementHandles matching the broad definition of support items.
	 */
	async getOverallResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.results );
	}

	/**
	 * Returns the number of support items that are shown on screen regardless of its classification.
	 *
	 * @returns {Promise<number>} Number of search result items shown in the popover.
	 */
	async getOverallResultsCount(): Promise< number > {
		const items = await this.getOverallResults();
		return items.length;
	}

	/* Returns the results for support entries. */

	/**
	 * Returns an array of ElementHandles that are of the support article category.
	 *
	 * @returns {Promise<ElementHandle[]>} Array of ElementHandles referencing support pages.
	 */
	async getSupportResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.supportItems );
	}

	/**
	 * Returns the number of support items that are of the support article category.
	 *
	 * @returns {Promise<number>} Number of search result items that link to support pages.
	 */
	async getSupportResultsCount(): Promise< number > {
		const items = await this.getSupportResults();
		return items.length;
	}

	/* Returns the results for admin entries. */

	/**
	 * Returns an array of ElementHandles that are of the administrative links category.
	 *
	 * @returns {Promise<ElementHandle[]>} Array of ElementHandles referencing administrative pages.
	 */
	async getAdminResults(): Promise< ElementHandle[] > {
		return await this.getResults( selectors.adminItems );
	}

	/**
	 * Returns the number of support items that are of the administrative links category.
	 *
	 * @returns {Promise<number>} Number of search result items that link to administrative pages.
	 */
	async getAdminResultsCount(): Promise< number > {
		const items = await this.getAdminResults();
		return items.length;
	}

	/**
	 * Checks whether popover search shows no results as expected.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async noResults(): Promise< void > {
		// Note that even for a search query like ;;;ppp;;; that produces no search results,
		// some links are shown in the popover under the heading `Helpful resources for this section`.
		const adminResults = await this.getAdminResults();
		assert.deepStrictEqual( [], adminResults );
		const supportResults = await this.getSupportResults();
		assert.deepStrictEqual( [], supportResults );
		await this.page.waitForSelector( selectors.emptyResults );
	}

	/* Interaction with results */
	/**
	 * Click on the nth result specified by the target value.
	 *
	 * @param {number} target The nth result to click.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If the specified target exceeds the number of results shown on page.
	 */
	async clickResult( target: number ): Promise< void > {
		const popOver = await this.page.waitForSelector( selectors.supportPopover );
		await popOver.waitForElementState( 'stable' );
		const items = await this.getOverallResults();

		const resultCount = items.length;
		if ( resultCount < target ) {
			throw new Error(
				`Support popover shows ${ resultCount } entries, was asked to click on entry ${ target }`
			);
		}

		await items[ target ].click();
		await this.page.click( selectors.readMoreButton );
	}

	/**
	 * Visit the support article from the inline support popover.
	 *
	 * @returns {Promise<Page>} Reference to support page.
	 */
	async visitArticle(): Promise< Page > {
		const browserContext = this.page.context();
		const [ newPage ] = await Promise.all( [
			browserContext.waitForEvent( 'page' ),
			this.page.click( selectors.visitArticleButton ),
		] );
		await newPage.waitForLoadState( 'domcontentloaded' );
		return newPage;
	}

	/**
	 * Closes the support article displayed on screen.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closeArticle(): Promise< void > {
		await this.page.click( selectors.closeButton );
	}

	/* Search input */

	/**
	 * Fills the support popover search input and waits for the query to complete.
	 *
	 * @param {string} text Search keyword to be entered into the search field.
	 * @returns {Promise<void>} No return value.
	 */
	async search( text: string ): Promise< void > {
		if ( text.trim() ) {
			// If there is valid search string, then there should be a network request made.
			// Wait for the response to the request and ensure the status is HTTP 200.
			await Promise.all( [
				this.page.waitForResponse(
					( response ) => response.url().includes( 'search?' ) && response.status() === 200,
					{ timeout: 60000 }
				),
				this.page.waitForSelector( selectors.resultsPlaceholder, { state: 'detached' } ),
				this.page.fill( selectors.searchInput, text ),
			] );
		} else {
			// If invalid search string (eg. '     '), then no request is made.
			await this.page.fill( selectors.searchInput, text );
		}

		// In all cases, wait for the 'load' state to be fired.
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Clears the search field of all keywords.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clearSearch(): Promise< void > {
		await this.page.click( selectors.clearSearch );
	}
}
