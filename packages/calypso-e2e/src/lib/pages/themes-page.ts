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

	async _postInit(): Promise<void> {
		await this.page.waitForSelector( selectors.spinner, {state: 'hidden'});
	}

	async filterThemes( type: 'All' | 'Free' | 'Premium' ): Promise<void> {
		await this.page.click( selectors.showAllThemesButton );
		const searchToolbar = await this.page.waitForSelector( selectors.searchToolbar );
		const button = await searchToolbar.waitForSelector( `a[data-e2e-value=${type.toLowerCase()}]` );
		await button.click();
		await this.page.waitForSelector( selectors.placeholder, {state: 'hidden'});
		const isSelected = await button.getAttribute('aria-checked');
		assert.strictEqual( isSelected, 'true' );
	}

	async search( keyword: string ):Promise<void> {
		const searchInput = await this.page.waitForSelector( selectors.searchInput );
		await searchInput.fill( keyword );
		await this.page.waitForSelector( selectors.placeholder, {state: 'hidden'});
	}

	async select( name: string): Promise<void> {
		const selectedTheme = await this.page.waitForSelector(`${selectors.items}:has-text("${name}")`, {state: 'visible'});
		await selectedTheme.click();
	}
}
