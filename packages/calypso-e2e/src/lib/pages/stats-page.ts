import { Page } from 'playwright';
import { clickNavTab } from '../../element-helper';
import envVariables from '../../env-variables';

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
		try {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				const dismissModalButton = this.page.getByRole( 'button', { name: 'Got it' } );
				await dismissModalButton.click( { timeout: 3000 } );
				await dismissModalButton.waitFor( { state: 'hidden' } );
			}
		} catch ( e ) {}
		await clickNavTab( this.page, name );
	}
}
