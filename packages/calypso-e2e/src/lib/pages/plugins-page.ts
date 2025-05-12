import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	// React modal buttons
	modalButtonWithText: ( text: string ) => `.dialog__action-buttons button:has-text("${ text }")`,

	listTitle: ( section: string ) => `.plugins-results-header__title:text("${ section }")`,
	listSubtitle: ( section: string ) => `.plugins-results-header__subtitle:text("${ section }")`,
	headerTitle: ( section: string ) => `.plugins-results-header__title:text("${ section }")`,
	pluginTitle: ( plugin: string ) => `.plugins-browser-item__title:text("${ plugin }")`,
	pluginTitleOnSection: ( section: string, plugin: string ) =>
		`.plugins-browser-list:has(.plugins-results-header__title:text("${ section }")) :text-is("${ plugin }")`,
	sectionTitles: '.plugins-results-header__title',
	browseAllFree: 'a[href^="/plugins/browse/popular"]',
	browseAllPaid: 'a[href^="/plugins/browse/paid"]',
	browseFirstCategory: 'button:has-text("Search Engine Optimization")',
	breadcrumb: ( section: string ) => `.navigation-header__main a:text("${ section }") `,
	pricingToggle: ':text("Monthly Price"), :text("Annual Price")',
	monthlyPricingSelect: 'a[data-bold-text^="Monthly price"]',
	annualPricingSelect: 'a[data-bold-text^="Annual price"]',
	monthlyPricing: '.plugins-browser-item__period:text("monthly")',
	annualPricing: '.plugins-browser-item__period:text("per year")',

	// Search
	searchInput: '.components-search-control .components-input-control__input',
	searchResult: ( text: string ) => `.plugins-browser-item__title:text("${ text }")`,
	// eslint-disable-next-line no-useless-escape
	searchResultTitle: ( text: string ) => `:text('plugins for "${ text }"')`,

	// Plugin view
	installButton: 'button:text("Install and activate")',
	deactivateButton: 'button:text("Deactivate")',
	activateButton: 'button:text("Activate")',
	openRemoveMenuButton: '.plugin-details-cta__manage-plugin-menu button[title="Toggle menu"]',
	removeButton: '.popover__menu button:has-text("Remove")',

	// Category selector
	selectedCategory: ( categoryTitle: string ) => `.categories__header:text("${ categoryTitle }")`,

	// Plugin details view
	pluginDetailsHeaderTitle: ( section: string ) =>
		`.plugin-details-header__name:text("${ section }")`,
	planUpgradeRequiredIcon: 'span.plugin-details-cta__upgrade-required-icon',

	// Post install
	installedPluginCard: '.thank-you__step',
	installedfooterCards: '.thank-you__footer',
	manageInstalledPluginButton: 'a:has-text("Manage plugin")',
};

/**
 * Plugins page https://wordpress.com/plugins/.
 */
export class PluginsPage {
	private page: Page;

	static paidSection = 'Must-have premium plugins';
	static featuredSection = 'Our developers’ favorites';
	static freeSection = 'Popular Plugins';

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
		await Promise.all( [
			this.page.waitForResponse( /\/sites\/\d+\/plugins/, { timeout: 20 * 1000 } ),
			// This is one of the last, reliable web requests to finish on this page
			// and is a pretty good indicator the async loading is done.
			this.page.goto( getCalypsoURL( `plugins/${ site }` ), { timeout: 20 * 1000 } ),
		] );
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
		let categoryLocator;
		if ( isDesktop ) {
			categoryLocator = this.page.getByRole( 'radio', { name: category } );
		} else {
			await this.page.getByRole( 'button', { name: 'More', exact: true } ).click();
			categoryLocator = this.page.getByRole( 'menuitem', { name: category } );
		}
		await categoryLocator.click();
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
	 * Deactivate the plugin on the current plugin page.
	 */
	async clickDeactivatePlugin(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Deactivate', exact: true } ).click();
		await this.page.getByRole( 'button', { name: 'Activate', exact: true } ).waitFor();
	}

	/**
	 * Clicks on the button to install the plugin.
	 *
	 * For sites without a supported plan, this method will click on the additional
	 * modal that appears prompting the user to purchase a plan upgrade.
	 */
	async clickInstallPlugin(): Promise< void > {
		const needsPlanUpgrade = await this.page.locator( selectors.planUpgradeRequiredIcon ).count();

		if ( needsPlanUpgrade ) {
			await Promise.all( [
				this.page.waitForResponse( /eligibility/ ),
				// Depending on whethe the plugin is free or requires a monthly subscription,
				// the text shown on the install button is slightly different.
				this.page.getByRole( 'button', { name: /(Purchase|Upgrade) and activate/ } ).click(),
			] );
			// Modal will appear to re-confirm to the user that an upgrade is necessary.
			// Accept the confirmation.
			await this.page.getByRole( 'button', { name: 'Upgrade and activate plugin' } ).click();
		} else {
			await Promise.all( [
				this.page.waitForResponse( /.*install\?.*/ ),
				this.page.getByRole( 'button', { name: 'Install and activate' } ).click(),
			] );
		}
	}

	/**
	 * Clicks on the `Remove Plugin` button.
	 */
	async clickRemovePlugin(): Promise< void > {
		const openRemoveMenuButtonLocator = this.page.locator( selectors.openRemoveMenuButton );
		await openRemoveMenuButtonLocator.click();

		const removeButtonLocator = this.page.locator( selectors.removeButton );
		await removeButtonLocator.click();
		const confirmDialogButton = this.page.locator( selectors.modalButtonWithText( 'Remove' ) );
		await Promise.all( [
			this.page.waitForResponse( /.*delete\?.*/ ),
			confirmDialogButton.click(),
		] );
	}

	/**
	 * Validates you've landed on the confirmation page post-install.
	 *
	 * @param {string} expectedPluginName Name of the plugin to validate.
	 */
	async validateConfirmationPagePostInstall( expectedPluginName?: string ): Promise< void > {
		await this.page
			.getByRole( 'heading', { name: "Congrats on your site's new superpowers!" } )
			.click();

		// Check for expiration text
		await this.page.locator( selectors.installedPluginCard ).getByText( 'expire' ).waitFor();

		// Check for the correct footer cards
		await this.page.locator( selectors.installedfooterCards ).getByText( 'Keep growing' ).waitFor();
		await this.page.locator( selectors.installedfooterCards ).getByText( 'Learn More' ).waitFor();

		// Check for plugin name
		if ( expectedPluginName ) {
			await this.page
				.locator( selectors.installedPluginCard )
				.getByText( expectedPluginName )
				.waitFor();
		}
	}

	/**
	 * After installing a plugin, clicks the button to manage that plugin.
	 */
	async clickManageInstalledPluginButton(): Promise< void > {
		await this.page.locator( selectors.manageInstalledPluginButton ).click();
	}

	/**
	 * Click on a category
	 */
	async clickCategory( name: string ): Promise< void > {
		await this.page.getByRole( 'radio', { name } ).click();
	}

	/**
	 * Open the categories dropdown, shown on mobile
	 */
	async openCategoriesDropdown(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'More', exact: true } ).click();
	}

	/**
	 * Open the categories dropdown, shown on mobile
	 */
	async clickDropdownCategory( name: string ): Promise< void > {
		await this.openCategoriesDropdown();
		await this.page.getByRole( 'menuitem', { name } ).click();
	}
}
