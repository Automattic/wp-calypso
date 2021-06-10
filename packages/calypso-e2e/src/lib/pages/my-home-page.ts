/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	dashboard: '.customer-home__main',
	statsCard: '.stats',
	visitSiteButton: '.customer-home__view-site-button >> text=Visit site',
};

/**
 * Page representing the WPCOM home dashboard.
 *
 * @augments {BaseContainer}
 */
export class MyHomePage extends BaseContainer {
	/**
	 * Constructs an instance of the MyHomePage object.
	 *
	 * @param {Page} page Underlying page on which interactions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.dashboard );
	}

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
