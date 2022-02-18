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
	 * Visit /plugins/*
	 */
	async visit( route?: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `${ route || '' }` ) );
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
