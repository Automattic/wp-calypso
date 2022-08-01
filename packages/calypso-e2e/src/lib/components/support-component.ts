import { Locator, Page, Response } from 'playwright';

type SupportResultType = 'article' | 'where';

const selectors = {
	// Components
	supportPopoverButton: ( { isActive }: { isActive?: boolean } = {} ) =>
		`button[title="Help"]${ isActive ? '.is-active' : '' }`,
	searchInput: '[aria-label="Search"]',
	clearSearch: '[aria-label="Close Search"]',
	supportCard: '.card.help-search',
	closeButton: '[aria-label="Close Help Center"]',
	backButton: 'button:has-text("Back")',
	backToTopButton: 'button:has-text("Back to top")',
	stillNeedHelpButton: 'a:has-text("Still need help?")',
	article: 'article',
	emailLink: 'div[role="button"]:has-text("Email")',

	// Results
	resultsPlaceholder: '.inline-help__results-placeholder-item',
	resultsPlaceholderHelpCenter: '.placeholder-lines__help-center-item',
	results: ( category: string ) => `[aria-labelledby="${ category }"] a`,
	defaultResultsMessage: 'h3:text("Recommended resources")',
	successfulSearchResponse: ( response: Response ) =>
		response.url().includes( 'search' ) && response.status() === 200,

	// Result types
	supportCategory: 'inline-search--api_help',
	whereCategory: 'inline-search--admin_section',
	emptyResults: ':has-text("Sorry, there were no matches.")',
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
			this.page.waitForSelector( selectors.resultsPlaceholderHelpCenter, { state: 'hidden' } ),
			this.page.waitForSelector( selectors.resultsPlaceholder, { state: 'hidden' } ),
		] );
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

		// This Promise.all wrapper contains many calls due to a certain level of uncertainty
		// when the support popover is launched.
		await Promise.all( [
			// Waits for all placeholder CSS elements to be removed from the DOM.
			this.waitForQueryComplete(),
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
	 * Given a selector, returns a Locator that match the given selector.
	 * Prior to selecing the elements, this method will wait for the 'load' event.
	 *
	 * @param {SupportResultType} category Type of support result item shown.
	 * @returns {Promise<Locator>} Locator that matches the given selector.
	 */
	async getResults( category: SupportResultType ): Promise< Locator > {
		await this.waitForQueryComplete();

		const selector = selectors.results(
			category === 'article' ? selectors.supportCategory : selectors.whereCategory
		);
		await this.page.waitForSelector( selector );
		return this.page.locator( selector );
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
			this.page.waitForResponse( selectors.successfulSearchResponse ),
			this.page.fill( selectors.searchInput, text ),
			this.waitForQueryComplete(),
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

	/**
	 * Clears the back button in the help center.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickBack(): Promise< void > {
		await this.page.click( selectors.backButton );
	}

	/**
	 * Scrolls a support article
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async scrollOpenArticle(): Promise< void > {
		await this.waitForQueryComplete();

		const elementHandle = await this.page.waitForSelector( selectors.article );
		await elementHandle.waitForElementState( 'stable' );

		await this.page.evaluate( ( element: SVGElement | HTMLElement ) => {
			return element.scrollIntoView( false );
		}, elementHandle );
	}

	/**
	 * Checks if back to top button is visible
	 *
	 * @returns {Promise<boolean>}
	 */
	async backToTopVisible( isVisible: boolean ): Promise< boolean > {
		if ( isVisible ) {
			return this.page.isVisible( selectors.backToTopButton );
		}
		return this.page.isHidden( selectors.backToTopButton );
	}

	/**
	 * Click back to top button
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickBackToTop(): Promise< void > {
		await this.page.click( selectors.backToTopButton );
	}

	/**
	 * Click still need help button
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async getStillNeedHelpButton(): Promise< Locator > {
		return this.page.locator( selectors.stillNeedHelpButton );
	}

	/**
	 * Click Email support button
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickEmailSupportButton(): Promise< void > {
		await this.page.click( selectors.emailLink );
	}
}
