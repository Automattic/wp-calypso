import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sectionTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
	pluginTitleOnSection: ( section: string, plugin: string ) =>
		`.plugins-browser-list:has(.plugins-browser-list__title.${ section }) :text-is("${ plugin }")`,
	sectionTitles: '.plugins-browser-list__title',
	browseAllPopular: 'a[href^="/plugins/popular"]',
	breadcrumb: ( section: string ) => `.plugins-browser__header li a:text("${ section }") `,
	pricingToggle: ':text("Monthly Price"), :text("Annual Price")',
	monthlyPricingSelect: 'a[data-bold-text^="Monthly price"]',
	annualPricingSelect: 'a[data-bold-text^="Annual price"]',
	monthlyPricing: '.plugins-browser-item__period:text("monthly")',
	annualPricing: '.plugins-browser-item__period:text("per year")',
	searchIcon: '.search-component__open-icon',
	searchInput: 'input[placeholder="Try searching ‘ecommerce’"]',
	searchResult: ( text: string ) => `.plugins-browser-item__title:text("${ text }")`,
	searchResultTitle: ( text: string ) => `:text("Search results for ${ text }")`,
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
	 * Visit /plugins or /plugins/:site
	 */
	async visit( site = '' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `plugins/${ site }` ) );
	}

	/**
	 * Visit /plugins/:page/ or /plugins/:page/:site
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
	 * Search
	 */
	async search( query: string ): Promise< void > {
		await this.page.click( selectors.searchIcon );
		await this.page.fill( selectors.searchInput, query );
		await this.page.press( selectors.searchInput, 'Enter' );
		await this.page.waitForSelector( selectors.searchResultTitle( query ) );
	}

	/**
	 * Validate Expected Search Result Found
	 */
	async validateExpectedSearchResultFound( expectedResult: string ): Promise< void > {
		await this.page.waitForSelector( selectors.searchResult( expectedResult ) );
	}
}
