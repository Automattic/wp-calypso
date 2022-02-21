import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sectionHeader: '.plugins-browser-list__header',
	sectionTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
	sectionTitles: '.plugins-browser-list__title',
	browseAll: 'a:text("Browse All")',
	breadcrumb: ( section: string ) => `.plugins-browser__header li a:text("${ section }") `,
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
	 * Click Browse All
	 */
	async clickBrowseAll(): Promise< void > {
		await this.page.click( selectors.browseAll );
		assert.match( this.page.url(), /.*\/plugins\/(featured|paid|new|popular)$/ );
	}

	/**
	 * Click breadcrumb
	 */
	async clickBreadcrumb( text: string ): Promise< void > {
		await this.page.click( selectors.breadcrumb( text ) );
		assert.match( this.page.url(), /.*\/plugins$/ );
	}
}
