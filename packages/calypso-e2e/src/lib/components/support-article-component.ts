/**
 * Internal dependencies
 */
import { BaseContainer } from '../base-container';

/**
 * Type dependencies
 */
import { Page } from 'playwright';

const selectors = {
	main: '.support-article-dialog__base .dialog__content',
};

/**
 * Represents the Support article dialog shown when a user clicks on a support article link from the Support popover.
 *
 * @augments {BaseContainer}
 */
export class SupportArticleComponent extends BaseContainer {
	/**
	 * Construct an instance of the Support Article component.
	 *
	 * @param {Page} page Underlying page with which the component will interact.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Confirms the support article is displayed on screen.
	 *
	 * @returns {Promise<void>} No return value.
	 *
	 */
	async articleDisplayed(): Promise< void > {
		await this.page.waitForSelector( selectors.main );
	}
}
