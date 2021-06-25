/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	// Main themes listing
	themes: '.themes__content',
	items: '.card.theme',

	// Transitions
	spinner: '.themes__content > .spinner',
	placeholder: '.themes-list .is-placeholder',

	// Search
	showAllThemesButton: 'text=Show all themes',
	searchToolbar: '.themes-magic-search',
	searchInput: `[placeholder="I'm creating a site for a: portfolio, magazine, business, wedding, blog, or…"]`,
};

/**
 * Component representing the Apperance > Themes page.
 *
 * @augments {BaseContainer}
 */
export class ThemesPage extends BaseContainer {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Post initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		await Promise.all( [
			this.page.waitForSelector( selectors.spinner, { state: 'hidden' } ),
			this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } ),
		] );
	}

	/**
	 * Filters the themes on page according to the pricing structure.
	 *
	 * @param {string} type Pre-defined types of themes.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If selected state of the theme filter button could not be confirmed.
	 */
	async filterThemes( type: 'All' | 'Free' | 'Premium' ): Promise< void > {
		const selector = `a[data-e2e-value=${ type.toLowerCase() }]`;
		await this.page.click( selector );
		// Wait for placeholder to disappear (indicating load is completed).
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
		const isSelected = await this.page.$eval( selector, ( element ) =>
			element.getAttribute( 'aria-checked' )
		);
		assert.strictEqual( isSelected, 'true' );
	}

	/**
	 * Given a keyword, perform a search in the Themes toolbar.
	 *
	 * @param {string} keyword Theme name to search for. Can be a partial match.
	 * @returns {Promise<void>} No return value.
	 */
	async search( keyword: string ): Promise< void > {
		const searchInput = await this.page.waitForSelector( selectors.searchInput );
		await searchInput.fill( keyword );
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
	}

	/**
	 * Select a theme by name.
	 *
	 * If the theme is not shown, this will throw an Error.
	 *
	 * @param {string} name Theme name to select.
	 * @returns {Promise<void>} No return value.
	 * @throws {Error} If theme is not shown on page.
	 */
	async select( name: string ): Promise< void > {
		const selectedTheme = await this.page.waitForSelector(
			`${ selectors.items }:has-text("${ name }")`,
			{ state: 'visible' }
		);

		if ( ! selectedTheme ) {
			throw new Error( `Requested theme ${ name } is not shown on page.` );
		}
		await selectedTheme.click();
	}
}
