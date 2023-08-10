import { Locator, Page } from 'playwright';

export type ResultsCategory = 'Docs' | 'Calypso Link';

/**
 * Represents the Help Center popover.
 */
export class SupportComponent {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = this.page.locator( '.help-center__container' );
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
		if ( await this.anchor.count() ) {
			return;
		}

		await helpButton.click();
		await this.anchor.waitFor( { state: 'visible' } );
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
		if ( ! ( await this.anchor.count() ) ) {
			return;
		}

		await helpButton.click();
		await this.anchor.waitFor( { state: 'detached' } );
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
			articleCount: await this.anchor
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Recommended resources' } )
				.count(),
			linkCount: await this.anchor
				.getByLabel( 'Search Results' )
				.getByRole( 'list', { name: 'Show me where to' } )
				.count(),
		};
	}

	/**
	 * Interact with the search result based on index.
	 *
	 * @param {ResultsCategory} category Category of results to click on.
	 * @param {number} index Locate results based on index. 0-indexed.
	 */
	async clickResultByIndex( category: ResultsCategory, index: number ) {
		const categoryText = category === 'Docs' ? 'Recommended resources' : 'Show me where to';

		const locator = this.anchor
			.getByRole( 'list', { name: categoryText } )
			.getByRole( 'listitem' )
			.nth( index );

		await locator.waitFor();
		await locator.click();

		if ( category === 'Docs' ) {
			// Sometimes, the network call for the help doc can be slow.
			await this.page.waitForResponse( /\/help\/article/, { timeout: 15 * 1000 } );
		}
	}

	/**
	 * Returns the title of the article being viewed.
	 *
	 * @returns {string} Title of the article.
	 */
	async getOpenArticleTitle(): Promise< string > {
		const locator = this.anchor.getByRole( 'article' ).getByRole( 'heading' ).first();

		await locator.waitFor();
		return await locator.innerText();
	}

	/**
	 * Clicks on the "Back" button when an article is open.
	 */
	async goBack(): Promise< void > {
		const locator = this.anchor.getByRole( 'button', { name: 'Back', exact: true } );

		await locator.waitFor();
		await locator.click();
	}

	/* Search input */

	/**
	 * Fills the support popover search input and waits for the query to complete.
	 *
	 * @param {string} text Search keyword to be entered into the search field.
	 */
	async search( text: string ): Promise< void > {
		await Promise.all( [
			// If you don't wait for the request specific to your search, you can actually
			// go fast enough to act on default or old results!
			this.page.waitForResponse(
				( response ) => {
					return (
						response.request().url().includes( '/help/search/wpcom' ) &&
						response
							.request()
							.url()
							.includes( `query=${ encodeURIComponent( text ) }` )
					);
				},
				{ timeout: 15 * 1000 }
			),
			this.anchor.getByPlaceholder( 'Search for help' ).fill( text ),
		] );

		// Wait for the search results to populate.
		// For any query (valid or invalid), the Recommended resources will populate,
		// so check for the presence of results under this header.
		await this.anchor.locator( '.placeholder-lines__help-center' ).waitFor( { state: 'detached' } );
	}

	/**
	 * Clears the search field of all keywords.
	 */
	async clearSearch(): Promise< void > {
		const locator = this.page.getByRole( 'button', { name: 'Close Search' } );

		if ( await locator.count() ) {
			await locator.click();
		}
	}
}
