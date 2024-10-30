import { ElementHandle, Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	// Curent theme
	currentTheme: ( name: string ) => `.current-theme:has-text("${ name }")`,

	// Main themes listing
	items: '.card.theme-card',
	excludeActiveTheme: ':not(.theme-card--is-active)',

	// Transitions
	spinner: '.themes__content > .spinner',
	placeholder: '.themes-list .is-placeholder',
	actionableTheme: '.theme-card--is-actionable',

	// Search
	showAllThemesButton: 'text=Show all themes',
	searchToolbar: '.themes-magic-search',
	searchInput: '.themes__content input.search__input',
};

/**
 * Component representing the Apperance > Themes page.
 */
export class ThemesPage {
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
	 * Initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async pageSettled(): Promise< void > {
		await Promise.all( [
			this.page.waitForSelector( selectors.spinner, { state: 'hidden' } ),
			this.page.locator( selectors.actionableTheme ).first().waitFor(),
		] );
	}

	/**
	 * Given a keyword, perform a search in the Themes toolbar.
	 *
	 * @param {string} keyword Theme name to search for. Can be a partial match.
	 * @returns {Promise<void>} No return value.
	 */
	async search( keyword: string ): Promise< void > {
		await this.pageSettled();

		const searchInput = await this.page.waitForSelector( selectors.searchInput );
		await searchInput.fill( keyword );
		await Promise.all( [ this.page.waitForNavigation(), searchInput.press( 'Enter' ) ] );
		// wait for the loadin placeholders to appear after search is triggered
		await this.page.waitForSelector( selectors.placeholder, { state: 'attached' } );
		// wait for an actionable theme to appear, meaning the search results are shown
		await this.page.locator( selectors.actionableTheme ).first().waitFor();
	}

	/**
	 * Selects a theme from the gallery.
	 *
	 * This method can perform either exact name match or a fuzzy (partial) name match.
	 * To match exactly, supply the full name of the theme as it appears to the user.
	 * For a fuzzy match, supply partially the name of the them that should be matched.
	 *
	 * The first available theme is always returned.
	 *
	 * Example:
	 * 		partial match: `Twenty Twen` -> [Twenty Twenty, Twenty Twenty-One]
	 * 		exact match: `Twenty Seventeen` -> Twenty Seventeen
	 *
	 * @param {string} [name] Theme name to select.
	 * @returns {Promise<ElementHandle>} Reference to the selected theme card on the gallery.
	 */
	async select( name: string ): Promise< ElementHandle > {
		// Build selector that will select themes on the page that match the name but excludes
		// the currently activated theme from selection (even if shown on page).
		const selector = `${ selectors.items }:has-text("${ name }")${ selectors.excludeActiveTheme }`;
		// Get number of themes being shown on page.
		const numThemes = await this.page.$$( selector ).then( ( themes ) => themes.length );
		if ( numThemes === 0 ) {
			throw new Error( `No theme shown on page that match name: ${ name }.` );
		}

		// Select the first available theme as the target.
		return await this.page.waitForSelector( `:nth-match(${ selector }, 1)` );
	}

	/**
	 * Given a target theme, hover over the card in the theme gallery and perform a click.
	 *
	 * @param {ElementHandle} selectedTheme Reference to the target theme.
	 * @returns {Promise<void>} No return value.
	 */
	async hoverThenClick( selectedTheme: ElementHandle ): Promise< void > {
		// Hover over the target theme in the gallery. This will expose a normally hidden
		// INFO button.
		await selectedTheme.hover();
		// Wait for the fade-in animation to complete.
		await selectedTheme.waitForElementState( 'stable' );
		// Clicking on the INFO button will always result in navigation to a new page.
		await Promise.all( [ this.page.waitForNavigation(), selectedTheme.click() ] );
	}

	/**
	 * Validates that the current theme (at top) is the expected theme. Throws if it is not.
	 *
	 * @param expectedTheme Expected theme name.
	 */
	async validateCurrentTheme( expectedTheme: string ): Promise< void > {
		await this.page.waitForSelector( selectors.currentTheme( expectedTheme ) );
	}

	/**
	 * Visit the Theme showcase page.
	 *
	 * @param siteSlug
	 */
	async visitShowcase( siteSlug: string | null = null ) {
		const targetUrl = `themes/${ siteSlug ?? '' }`;

		// We are getting a pending status for https://wordpress.com/cspreport intermittently
		// which causes the login to hang on networkidle when running the tests locally.
		// This fulfill's the route request with status 200.
		// See https://github.com/Automattic/wp-calypso/issues/69294
		await this.page.route( '**/cspreport', ( route ) => {
			route.fulfill( {
				status: 200,
			} );
		} );
		await this.page.goto( getCalypsoURL( targetUrl ) );
	}
}
