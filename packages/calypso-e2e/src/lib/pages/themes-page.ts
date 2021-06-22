/**
 * External dependencies
 */
import assert from 'assert';

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
	searchInput: '.themes-magic-search-card input.search__input',
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
		await this.page.waitForSelector( selectors.spinner, { state: 'hidden' } );
	}

	/**
	 * Filters the themes on page by clicking on the selector passed in as argument.
	 *
	 * @param {string} type Pre-defined types of themes.
	 * @returns {Promise<void>} No return value.
	 */
	async filterThemes( type: 'All' | 'Free' | 'Premium' ): Promise< void > {
		await this.page.click( selectors.showAllThemesButton );
		const searchToolbar = await this.page.waitForSelector( selectors.searchToolbar );
		const button = await searchToolbar.waitForSelector(
			`a[data-e2e-value=${ type.toLowerCase() }]`
		);
		await button.click();
		// This will wait for all placeholder classes to return to hidden state.
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
		// Verify that filter has been successfully applied.
		const isSelected = await button.getAttribute( 'aria-checked' );
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
