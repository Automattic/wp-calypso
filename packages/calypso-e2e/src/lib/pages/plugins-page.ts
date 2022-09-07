import assert from 'assert';
import { Page, Locator } from 'playwright';
import { getCalypsoURL } from '../../data-helper';
import envVariables from '../../env-variables';

type PluginAttributes = 'Active' | 'Autoupdate';
type PluginState = 'on' | 'off';

const selectors = {
	// React modal buttons
	modalButtonWithText: ( text: string ) => `.dialog__action-buttons button:has-text("${ text }")`,

	listTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
	listSubtitle: ( section: string ) => `.plugins-browser-list__subtitle:text("${ section }")`,
	headerTitle: ( section: string ) => `.plugin-category-results-header__title:text("${ section }")`,
	pluginTitle: ( plugin: string ) => `.plugins-browser-item__title:text("${ plugin }")`,
	pluginTitleOnSection: ( section: string, plugin: string ) =>
		`.plugins-browser-list:has(.plugins-browser-list__title.${ section }) :text-is("${ plugin }")`,
	sectionTitles: '.plugins-browser-list__title',
	browseAllFree: 'a[href^="/plugins/browse/popular"]',
	browseAllPaid: 'a[href^="/plugins/browse/paid"]',
	browseFirstCategory: 'button:has-text("Search Engine Optimization")',
	categoryButton: ( section: string ) =>
		`button:has-text("${ section }"),a:has-text("${ section }")`,
	breadcrumb: ( section: string ) => `.fixed-navigation-header__header a:text("${ section }") `,
	pricingToggle: ':text("Monthly Price"), :text("Annual Price")',
	monthlyPricingSelect: 'a[data-bold-text^="Monthly price"]',
	annualPricingSelect: 'a[data-bold-text^="Annual price"]',
	monthlyPricing: '.plugins-browser-item__period:text("monthly")',
	annualPricing: '.plugins-browser-item__period:text("per year")',

	// Search
	searchIcon: '.search-component__open-icon',
	searchInput: 'input.search-component__input',
	searchResult: ( text: string ) => `.plugins-browser-item__title:text("${ text }")`,
	// eslint-disable-next-line no-useless-escape
	searchResultTitle: ( text: string ) => `:text('plugins for "${ text }"')`,

	// Plugin view
	pluginHamburgerMenu: `.plugin-site-jetpack__action`,
	pluginToggle: ( target: PluginAttributes ) =>
		`.plugin-site-jetpack__container .components-toggle-control:has(span:text("${ target }")) span.components-form-toggle`,
	installButton: 'button:text("Install and activate")',
	removeButton: 'button.plugin-remove-button__remove-button',

	// Category selector
	selectedCategory: ( categoryTitle: string ) => `.categories__header:text("${ categoryTitle }")`,

	// Plugin details view
	pluginDetailsHeaderTitle: ( section: string ) =>
		`.plugin-details-header__name:text("${ section }")`,
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
		await this.page.goto( getCalypsoURL( `plugins/${ site }` ), { waitUntil: 'networkidle' } );
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
		await this.page.waitForSelector( selectors.listTitle( section ) );
	}

	/**
	 * Validate page has a list subtitle containing text
	 */
	async validateHasSubtitle( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.listSubtitle( section ) );
	}

	/**
	 * Validate page has the right category selected
	 */
	async validateSelectedCategory( categoryTitle: string ): Promise< void > {
		await this.page.waitForSelector( selectors.selectedCategory( categoryTitle ) );
	}

	/**
	 * Validate page has a header title containing text
	 */
	async validateHasHeaderTitle( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.headerTitle( section ) );
	}

	/**
	 * Validate plugin details page has a header title containing text
	 */
	async validatePluginDetailsHasHeaderTitle( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.pluginDetailsHeaderTitle( section ) );
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
	 * Validate category has the plugin
	 */
	async validateHasPluginInCategory( section: string, plugin: string ): Promise< void > {
		await this.page.waitForSelector( selectors.headerTitle( section ) );
		await this.page.waitForSelector( selectors.pluginTitle( plugin ) );
	}

	/**
	 * Click Browse All Free Plugins
	 */
	async clickBrowseAllFreePlugins(): Promise< void > {
		await this.page.click( selectors.browseAllFree );
	}

	/**
	 * Click Browse All Paid Plugins
	 */
	async clickBrowseAllPaidPlugins(): Promise< void > {
		await this.page.click( selectors.browseAllPaid );
	}

	/**
	 * Validate Category Button
	 */
	async validateCategoryButton( category: string, isDesktop: boolean ): Promise< void > {
		const categoryLocator = this.page.locator( selectors.categoryButton( category ) );
		if ( isDesktop ) {
			await categoryLocator.nth( 1 ).click();
		} else {
			await categoryLocator.click();
		}
		await this.page.waitForSelector( selectors.headerTitle( category ) );
	}

	/**
	 * Click the "Back" breadcrumb
	 */
	async clickBackBreadcrumb(): Promise< void > {
		await this.page.click( selectors.breadcrumb( 'Back' ) );
	}

	/**
	 * Click the "Plugins" breadcrumb
	 */
	async clickPluginsBreadcrumb(): Promise< void > {
		await this.page.click( selectors.breadcrumb( 'Plugins' ) );
	}

	/**
	 * Click the "Search Results" breadcrumb
	 */
	async clickSearchResultsBreadcrumb(): Promise< void > {
		await this.page.click( selectors.breadcrumb( 'Search Results' ) );
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
		// On mobile viewports the Loupe icon must be
		// clicked to activate the search field.
		const searchInputIconLocator = this.page.locator( selectors.searchIcon );
		await searchInputIconLocator.click();

		await this.page.fill( selectors.searchInput, query );
		await this.page.press( selectors.searchInput, 'Enter' );
		await this.page.waitForSelector( selectors.searchResultTitle( query ) );
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
		const locator = this.page.locator( selectors.pluginToggle( 'Active' ) );
		if ( ( await locator.count() ) > 0 ) {
			return true;
		}
		return false;
	}

	/**
	 * Returns whether the toggle at `locator` is toggled
	 * in the On state.
	 *
	 * @returns {Promise<boolean>} True if toggle is on. False otherwise.
	 */
	private async isToggled( locator: Locator ): Promise< boolean > {
		await locator.waitFor();

		const classes = await locator.getAttribute( 'class' );
		return !! classes?.includes( 'is-checked' );
	}

	/**
	 * Toggles the plugin attribute.
	 *
	 * @param {PluginAttributes} target Target attribute to toggle.
	 * @param {PluginState} state Desired end state of the attribute.
	 */
	async togglePluginAttribute( target: PluginAttributes, state: PluginState ): Promise< void > {
		const toggleLocator = this.page.locator( selectors.pluginToggle( target ) );

		const isToggled = await this.isToggled( toggleLocator );

		// Only perform action if  the current state and
		// target state differ.
		if ( ( state === 'on' && ! isToggled ) || ( state === 'off' && isToggled ) ) {
			await toggleLocator.click();
		}
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
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			const pluginActionsLocator = this.page.locator( selectors.pluginHamburgerMenu );
			await pluginActionsLocator.click();
		}

		const locator = this.page.locator( selectors.removeButton );
		await locator.click();
		const confirmDialogButton = this.page.locator( selectors.modalButtonWithText( 'Remove' ) );
		await Promise.all( [
			this.page.waitForResponse( /.*delete\?.*/ ),
			confirmDialogButton.click(),
		] );
	}
}
