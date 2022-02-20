import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sectionTitle: '.plugins-browser-list__title',
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
	 * Has Section
	 */
	async onlyHasSections( sections: Array< string > ): Promise< void > {
		await this.page.waitForSelector( selectors.sectionTitle );
		const titles = await this.page.locator( selectors.sectionTitle );
		const count = await titles.count();
		assert.strictEqual( count, sections.length );
		for ( let i = 0; i < count; i++ ) {
			const title = await titles.nth( i ).innerText();
			assert.strictEqual( title, sections[ i ] );
		}
	}
}
