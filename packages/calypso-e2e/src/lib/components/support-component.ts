import { ElementHandle, Page } from 'playwright';

type SupportResultType = 'article' | 'where';

const selectors = {
	// Components
	supportPopoverButton: `button[title="Help"]`,
	supportPopover: '.inline-help__popover',
	searchInput: '[aria-label="Search"]',
	clearSearch: '[aria-label="Close Search"]',
	supportCard: '.card.help-search',
	spinner: '.spinner',

	// Results
	resultsPlaceholder: '.inline-help__results-placeholder-item',
	results: ( category: string ) => `[aria-labelledby="${ category }"] .inline-help__results-item`,
	defaultResultsMessage: 'h3:text("This might interest you")',

	// Result types
	supportCategory: 'inline-search--api_help',
	whereCategory: 'inline-search--admin_section',
	emptyResults: ':has-text("Sorry, there were no matches.")',

	// Article
	readMoreButton: 'text=Read more',
	supportArticlePlaceholder: 'p.support-article-dialog__placeholder-text',
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
	 *
	 */
	async waitForQueryComplete(): Promise< void > {
		await Promise.all( [
			this.page.waitForSelector( selectors.resultsPlaceholder, { state: 'hidden' } ),
			this.page.waitForSelector( selectors.spinner, { state: 'hidden' } ),
		] );
	}

	/**
	 * Opens the support popover from the closed state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openPopover(): Promise< void > {
		if ( await this.page.isVisible( selectors.supportPopover ) ) {
			return;
		}

		// This Promise.all wrapper contains many calls due to a certain level of uncertainty
		// when the support popover is launched.
		await Promise.all( [
			// Waits for all placeholder CSS elements to be removed from the DOM.
			this.waitForQueryComplete(),
			// Waits for one of the network request (triggered by the opening of the popover) to complete.
			this.page.waitForResponse(
				( response ) => response.status() === 200 && response.url().includes( 'kayako/mine?' )
			),
			this.page.click( selectors.supportPopoverButton ),
		] );

		// Obtain the element handle for the Support popover, then wait until the `is-active` attribute
		// is added.
		const elementHandle = await this.page.waitForSelector( selectors.supportPopoverButton );
		await this.page.waitForFunction(
			( element: HTMLElement | SVGElement ) => element.classList.contains( 'is-active' ),
			elementHandle
		);
	}

	/**
	 * Closes the support popover from the open state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closePopover(): Promise< void > {
		if ( await this.page.isHidden( selectors.supportPopover ) ) {
			return;
		}
		await this.page.click( selectors.supportPopoverButton );
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
	 * Checks whether the Support popover/card is in a default state (ie. no search keyword).
	 */
	async defaultStateShown(): Promise< void > {
		await this.page.waitForSelector( selectors.defaultResultsMessage );
	}

	/**
	 * Given a selector, returns an array of ElementHandles that match the given selector.
	 * Prior to selecing the elements, this method will wait for the 'load' event.
	 *
	 * @param {SupportResultType} category Type of support result item shown.
	 * @returns {Promise<ElementHandle[]>} Array of ElementHandles that match the given selector.
	 */
	async getResults( category: SupportResultType ): Promise< ElementHandle[] > {
		await this.waitForQueryComplete();

		if ( category === 'article' ) {
			return await this.page.$$( selectors.results( selectors.supportCategory ) );
		}
		return await this.page.$$( selectors.results( selectors.whereCategory ) );
	}

	/**
	 * Checks whether popover search shows no results as expected.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async noResultsShown(): Promise< void > {
		// Note that even for a search query like ;;;ppp;;; that produces no search results,
		// some links are shown in the popover under the heading `Helpful resources for this section`.
		await this.page.waitForSelector( selectors.emptyResults );
	}

	/* Interaction with results */

	/**
	 * Click on the nth result specified by the target value.
	 *
	 * @param {SupportResultType} category Type of support result item shown.
	 * @param {number} target The nth result to click under the type of result.
	 */
	async clickResult( category: SupportResultType, target: number ): Promise< void > {
		let selector: string;

		if ( category === 'article' ) {
			selector = selectors.results( selectors.supportCategory );
		} else {
			selector = selectors.results( selectors.whereCategory );
		}

		await this.page.click( `:nth-match(${ selector }, ${ target })` );
	}

	/**
	 * Visit the support article from the inline support popover.
	 *
	 * @returns {Promise<Page>} Reference to support page.
	 */
	async visitArticle(): Promise< Page > {
		await Promise.all( [
			this.page.waitForSelector( selectors.supportArticlePlaceholder, { state: 'hidden' } ),
			this.page.click( selectors.readMoreButton ),
		] );
		const visitArticleHandle = await this.page.waitForSelector( selectors.visitArticleButton );
		await visitArticleHandle.waitForElementState( 'stable' );

		const browserContext = this.page.context();
		// `Visit article` launches a new page.
		const [ newPage ] = await Promise.all( [
			browserContext.waitForEvent( 'page' ),
			this.page.click( selectors.visitArticleButton ),
		] );
		await newPage.waitForLoadState( 'domcontentloaded' );

		// Return handler to the new tab.
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
		// Wait for the response to the request and ensure the status is HTTP 200.
		await Promise.all( [
			this.page.waitForResponse(
				( response ) => response.url().includes( 'search?' ) && response.status() === 200
			),
			this.page.waitForSelector( selectors.resultsPlaceholder, { state: 'hidden' } ),
			this.page.waitForSelector( selectors.spinner, { state: 'hidden' } ),
			this.page.fill( selectors.searchInput, text ),
		] );
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
