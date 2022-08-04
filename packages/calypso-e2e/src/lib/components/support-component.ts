import { Locator, Page, Response } from 'playwright';

type SupportResultType = 'article' | 'where';

const selectors = {
	editorIframe: `iframe.is-loaded[src*="wp-admin"]`,
	supportPopoverButton: 'button[title="Help"], button[aria-label="Help"]',
	searchInput: '[aria-label="Search"]',
	searchResults: '[aria-label="Search Results"]',
	clearSearch: '[aria-label="Close Search"]',
	supportCard: '.card.help-search',
	closeButton: '[aria-label="Close Help Center"]',
	backButton: 'button.back-button__help-center',
	backToTopButton: 'button:has-text("Back to top")',
	stillNeedHelpButton: 'a:has-text("Still need help?")',
	article: '.help-center-article-content__story-content',
	emailLink: 'div[role="button"]:has-text("Email")',

	// Results
	resultsPlaceholder: '.inline-help__results-placeholder',
	resultsPlaceholderHelpCenter: '.placeholder-lines__help-center',
	results: ( category: string ) => `[aria-labelledby="${ category }"] a`,
	defaultResultsMessage: 'h3:text("Recommended resources")',
	successfulSearchResponse: ( response: Response ) =>
		response.url().includes( 'search' ) && response.status() === 200,

	// Result types
	supportCategory: 'inline-search--api_help',
	whereCategory: 'inline-search--admin_section',
	emptyResults: 'p:has-text("Sorry, there were no matches.")',
};

/**
 * Represents the Support popover available on most WPCOM screens.
 */
export class SupportComponent {
	private page: Page;
	private content: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param { inIframe boolean } options Support component options.
	 */
	constructor( page: Page, { inIFrame }: { inIFrame?: boolean } = {} ) {
		this.page = page;

		if ( inIFrame ) {
			this.content = page.frameLocator( selectors.editorIframe ).locator( 'body' );
		} else {
			this.content = page.locator( 'body' );
		}
	}

	/**
	 * Waits for placeholders (spinners) to be hidden
	 */
	async waitForQueryComplete(): Promise< void > {
		await Promise.all( [
			this.content.locator( selectors.resultsPlaceholderHelpCenter ).waitFor( { state: 'hidden' } ),
			this.content.locator( selectors.resultsPlaceholder ).waitFor( { state: 'hidden' } ),
		] );
	}

	/**
	 * Opens the support popover from the closed state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openPopover(): Promise< void > {
		// This Promise.all wrapper contains many calls due to a certain level of uncertainty
		// when the support popover is launched.
		await Promise.all( [
			// Waits for all placeholder CSS elements to be removed from the DOM.
			this.waitForQueryComplete(),
			this.content.locator( selectors.supportPopoverButton ).click(),
		] );
	}

	/**
	 * Closes the support popover from the open state.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closePopover(): Promise< void > {
		const closeButton = await this.content.locator( selectors.closeButton ).elementHandle();

		if ( closeButton ) {
			if ( await closeButton.isHidden() ) {
				return;
			}
			await closeButton.click();
			await closeButton.isHidden();
		}
	}

	/**
	 * Wait for and scroll to expose the Support card, present only on My Home.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async showSupportCard(): Promise< void > {
		const elementHandle = await this.content.locator( selectors.supportCard ).elementHandle();
		if ( elementHandle ) {
			await elementHandle.waitForElementState( 'stable' );
			await elementHandle.scrollIntoViewIfNeeded();
		}
	}

	/* Result methods */

	/**
	 * Checks whether the Support popover/card is in a default state (ie. no search keyword).
	 */
	async defaultStateShown(): Promise< void > {
		await this.content.locator( selectors.defaultResultsMessage ).elementHandle();
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

		await this.content.locator( selectors.searchResults ).waitFor( { state: 'visible' } );

		return this.content.locator(
			selectors.results(
				category === 'article' ? selectors.supportCategory : selectors.whereCategory
			)
		);
	}

	/**
	 * Checks whether popover search shows no results as expected.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async noResultsShown(): Promise< void > {
		// Note that even for a search query like ;;;ppp;;; that produces no search results,
		// some links are shown in the popover under the heading `Helpful resources for this section`.
		await this.content.locator( selectors.emptyResults ).elementHandle();
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

		await this.content.locator( `:nth-match(${ selector }, ${ target })` ).click();
	}

	/* Search input */

	/**
	 * Fills the support popover search input and waits for the query to complete.
	 *
	 * @param {string} text Search keyword to be entered into the search field.
	 * @returns {Promise<void>} No return value.
	 */
	async search( text: string ): Promise< void > {
		await this.content.locator( selectors.searchInput ).fill( text );
		await this.page.waitForResponse( selectors.successfulSearchResponse );
		await this.waitForQueryComplete();
	}

	/**
	 * Search word by word until the results appear
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async searchForceResults( text: string ): Promise< void > {
		const resultsSelector = selectors.results( selectors.supportCategory );

		for ( let i = 0; i < text.length; i++ ) {
			const nextPosition = i + 1;
			const nextChar = text.charAt( nextPosition );
			if ( nextPosition === text.length || nextChar === ' ' ) {
				await this.search( text.substring( 0, i + 1 ) );
				const results = await this.content.locator( resultsSelector ).count();
				if ( results > 0 ) {
					break;
				}
			}
		}
	}

	/**
	 * Clears the search field of all keywords.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clearSearch(): Promise< void > {
		await this.content.locator( selectors.clearSearch ).click();
	}

	/**
	 * Clears the back button in the help center.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickBack(): Promise< void > {
		await this.content.locator( selectors.backButton ).click();
	}

	/**
	 * Scrolls a support article
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async scrollOpenArticle(): Promise< void > {
		const locator = this.content.locator( selectors.article );

		await this.waitForQueryComplete();
		const elementHandle = await locator.elementHandle();

		if ( elementHandle ) {
			await elementHandle.waitForElementState( 'stable' );
			await locator.evaluate( ( element: SVGElement | HTMLElement ) => {
				return element.scrollIntoView( false );
			}, elementHandle );
		}
	}

	/**
	 * Checks if back to top button is visible
	 *
	 * @returns {Promise<boolean>}
	 */
	async backToTopVisible( isVisible: boolean ): Promise< void > {
		return await this.content
			.locator( selectors.backToTopButton )
			.waitFor( { state: isVisible ? 'visible' : 'hidden' } );
	}

	/**
	 * Click back to top button
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickBackToTop(): Promise< void > {
		await this.content.locator( selectors.backToTopButton ).click();
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
