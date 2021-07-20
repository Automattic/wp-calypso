import { BaseContainer } from '../base-container';

const selectors = {
	// Main themes listing
	items: '.card.theme',
	excludeActiveTheme: ':not(.is-active)',

	// Transitions
	spinner: '.themes__content > .spinner',
	placeholder: '.themes-list .is-placeholder',

	// Search
	showAllThemesButton: 'text=Show all themes',
	searchToolbar: '.themes-magic-search',
	searchInput: `[placeholder="Search by style or feature: portfolio, store, multiple menus, or…"]`,
};

/**
 * Component representing the Apperance > Themes page.
 *
 * @augments {BaseContainer}
 */
export class ThemesPage extends BaseContainer {
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
	 */
	async filterThemes( type: 'All' | 'Free' | 'Premium' ): Promise< void > {
		const selector = `a[role="radio"]:has-text("${ type }")`;
		await this.page.click( selector );
		const button = await this.page.waitForSelector( selector );

		// Wait for placeholder to disappear (indicating load is completed).
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
		await this.page.waitForFunction( ( element: any ) => element.ariaChecked === 'true', button );
	}

	/**
	 * Given a keyword, perform a search in the Themes toolbar.
	 *
	 * @param {string} keyword Theme name to search for. Can be a partial match.
	 * @returns {Promise<void>} No return value.
	 */
	async search( keyword: string ): Promise< void > {
		const searchInput = await this.page.waitForSelector( selectors.searchInput );
		await Promise.all( [ this.page.waitForNavigation(), searchInput.fill( keyword ) ] );
		await this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } );
	}

	/**
	 * Selects a theme from the gallery.
	 *
	 * This method can perform either exact name match or a fuzzy (partial) name match.
	 * To match exactly, supply the full name of the theme as it appears to the user.
	 * For a fuzzy match, supply partially the name of the them that should be matched.
	 *
	 * Example:
	 * 		partial match: `Twenty Twen` -> [Twenty Twenty, Twenty Twenty-One]
	 * 		exact match: `Twenty Seventeen` -> Twenty Seventeen
	 *
	 * @param {string} [name] Theme name to select.
	 * @returns {Promise<void>} No return value.
	 */
	async select( name: string ): Promise< void > {
		// Build selector that will select themes on the page that match the name but excludes
		// the currently activated theme from selection (even if shown on page).
		const selector = `${ selectors.items }:has-text("${ name }")${ selectors.excludeActiveTheme }`;
		// Get number of themes being shown on page.
		const numThemes = await this.page.$$( selector ).then( ( themes ) => themes.length );
		if ( numThemes === 0 ) {
			throw new Error( `No theme shown on page that match name: ${ name }.` );
		}

		// Select the first available theme as the target.
		const selectedTheme = await this.page.waitForSelector( `:nth-match(${ selector }, 1)` );

		// Hover over the target theme to expose the `INFO` button and wait for the animation to
		// complete.
		await selectedTheme.hover();
		await selectedTheme.waitForElementState( 'stable' );

		await Promise.all( [ this.page.waitForNavigation(), selectedTheme.click() ] );
	}
}
