import { BaseContainer } from '../base-container';

const selectors = {
	visitSiteButton: '.button >> text=Visit site',
};

/**
 * Page representing the WPCOM home dashboard.
 *
 * @augments {BaseContainer}
 */
export class MyHomePage extends BaseContainer {
	/**
	 * Click on the Visit Site button on the home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async visitSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.visitSiteButton ),
		] );
	}
}
