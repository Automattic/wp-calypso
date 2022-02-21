import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sectionTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
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
	async hasSection( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.sectionTitle( section ) );
	}
}
