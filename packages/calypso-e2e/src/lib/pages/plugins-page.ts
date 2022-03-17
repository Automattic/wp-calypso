import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	// React modal buttons
	modalButtonWithText: ( text: string ) => `.dialog__action-buttons button:has-text("${ text }")`,

	sectionTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
	pluginTitleOnSection: ( section: string, plugin: string ) =>
		`.plugins-browser-list:has(.plugins-browser-list__title.${ section }) :text-is("${ plugin }")`,
	sectionTitles: '.plugins-browser-list__title',
	browseAllPopular: 'a[href^="/plugins/popular"]',
	breadcrumb: ( section: string ) => `.plugins-browser__header a:text("${ section }") `,
	pricingToggle: ':text("Monthly Price"), :text("Annual Price")',
	monthlyPricingSelect: 'a[data-bold-text^="Monthly price"]',
	annualPricingSelect: 'a[data-bold-text^="Annual price"]',
	monthlyPricing: '.plugins-browser-item__period:text("monthly")',
	annualPricing: '.plugins-browser-item__period:text("per year")',

	// Search
	searchInput: 'input.search-component__input',
	searchResult: ( text: string ) => `.plugins-browser-item__title:text("${ text }")`,
	searchResultTitle: ( text: string ) => `:text("Search results for ${ text }")`,

	// Plugin view
	activateToggle: '.plugin-activate-toggle span.components-form-toggle',
	installButton: 'button:text("Install and activate")',
	removeButton: 'button.plugin-remove-button__remove-button',
};

/**
 * Plugins page https://wordpress.com/plugins/.
 */
export class PluginsPage {
	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visit the Plugins page in Calypso at `/plugins`.
	 *
	 * If optional parameter `site` is specified, this method will
	 * attempt to load `/plugins/<site>` endpoint.
	 *
	 * @param {string} site Optional site URL.
	 */
	async visit( site = '' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `plugins/${ site }` ) );
	}

	/**
	 * Visit a specific page within the Plugins feature at `/plugins/page`.
	 *
	 * If optional paramter `site` is specified, this method will
	 * attempt to load `/plugins/<page>/<site>` endpoint.
	 *
	 * @param {string} page Sub-page to visit.
	 * @param {string} site Optional site URL.
	 */
	async visitPage( page: string, site = '' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `plugins/${ page }/${ site }` ) );
	}

	/**
	 * Validate page has the section
	 */
	async validateHasSection( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.sectionTitle( section ) );
	}

	/**
	 * Validate section is not present on page
	 */
	async validateNotHasSection( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.sectionTitles );
		const titles = this.page.locator( selectors.sectionTitles );
		const count = await titles.count();
		assert.notEqual( count, 0 ); // ensure at least one is loaded before checking the negative
		for ( let i = 0; i < count; i++ ) {
			const title = await titles.nth( i ).innerText();
			assert.notEqual( title, section );
		}
	}

	/**
	 * Validate page has the section
	 */
	async validateHasPluginOnSection( section: string, plugin: string ): Promise< void > {
		await this.page.waitForSelector( selectors.pluginTitleOnSection( section, plugin ) );
	}

	/**
	 * Click Browse All
	 */
	async clickBrowseAllPopular(): Promise< void > {
		await this.page.click( selectors.browseAllPopular );
	}

	/**
	 * Click the Back breadcrumb
	 */
	async clickBackBreadcrumb(): Promise< void > {
		await this.page.click( selectors.breadcrumb( 'Back' ) );
	}

	/**
	 * Click the Plugins breadcrumb
	 */
	async clickPluginsBreadcrumb(): Promise< void > {
		await this.page.click( selectors.breadcrumb( 'Plugins' ) );
	}

	/**
	 * Select monthly
	 */
	async selectMonthlyPricing(): Promise< void > {
		await this.page.click( selectors.pricingToggle );
		await this.page.click( selectors.monthlyPricingSelect );
	}

	/**
	 * Select annual
	 */
	async selectAnnualPricing(): Promise< void > {
		await this.page.click( selectors.pricingToggle );
		await this.page.click( selectors.annualPricingSelect );
	}

	/**
	 * Check Is Monthly Pricing
	 */
	async validateIsMonthlyPricing(): Promise< void > {
		await this.page.waitForSelector( selectors.monthlyPricing );
	}

	/**
	 * Check Is Annual Pricing
	 */
	async validateIsAnnualPricing(): Promise< void > {
		await this.page.waitForSelector( selectors.annualPricing );
	}

	/**
	 * Performs a search for the provided string.
	 *
	 * @param {string} query String to search for.
	 */
	async search( query: string ): Promise< void > {
		await this.page.fill( selectors.searchInput, query );
		await this.page.press( selectors.searchInput, 'Enter' );
	}

	/**
	 * Click on the search result.
	 *
	 * @param {string} name Name of the plugin to click.
	 */
	async clickSearchResult( name: string ): Promise< void > {
		await this.page.click( selectors.searchResult( name ) );
	}

	/**
	 * Validate Expected Search Result Found
	 */
	async validateExpectedSearchResultFound( expectedResult: string ): Promise< void > {
		await this.page.waitForSelector( selectors.searchResult( expectedResult ) );
	}

	/* Plugin View */

	/**
	 * Determines whether the plugin is installed on the page.
	 *
	 * This method determines if a plugin is installed by
	 * navigating to the `/plugins/<name>/site` endpoint, then
	 * counting for the instances of `removeButton`.
	 *
	 * If the `removeButton` count is greater than 0, then the plugin
	 * is deemed to be active on a site and thus this method returns
	 * true. False otherwise.
	 *
	 * @returns {Promise<boolean>} True if plugin is active on any site. False otherwise.
	 */
	async pluginIsInstalled(): Promise< boolean > {
		await this.page.waitForLoadState( 'networkidle' );
		const locator = this.page.locator( selectors.removeButton );
		if ( ( await locator.count() ) > 0 ) {
			return true;
		}
		return false;
	}

	/**
	 * Clicks on the Install Plugin button.
	 */
	async clickInstallPlugin(): Promise< void > {
		const locator = this.page.locator( selectors.installButton );
		await Promise.all( [ this.page.waitForResponse( /.*install\?.*/ ), locator.click() ] );
	}

	/**
	 * Clicks on the `Remove Plugin` button.
	 */
	async clickRemovePlugin(): Promise< void > {
		const locator = this.page.locator( selectors.removeButton );
		await locator.click();
		const confirmDialogButton = this.page.locator( selectors.modalButtonWithText( 'Remove' ) );
		await Promise.all( [
			this.page.waitForResponse( /.*delete\?.*/ ),
			confirmDialogButton.click(),
		] );
	}
}
