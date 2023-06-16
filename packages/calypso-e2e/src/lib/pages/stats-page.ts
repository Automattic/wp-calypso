import { Page } from 'playwright';
import { clickNavTab } from '../../element-helper';

export type StatsTabs = 'Traffic' | 'Insights' | 'Store';

/**
 * Represents the Statistics page.
 */
export class StatsPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a string, click on the tab name on the page.
	 *
	 * @param {StatsTabs} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: StatsTabs ): Promise< void > {
		const dismissModalButton = this.page.getByRole( 'button', { name: 'Got it' } );

		if ( ( await dismissModalButton.count() ) > 0 ) {
			await dismissModalButton.click();
			await dismissModalButton.waitFor( { state: 'hidden' } );
		}
		await clickNavTab( this.page, name );
	}
}
