import { BaseContainer } from '../base-container';

const selectors = {
	visitArticleButton: 'text="Visit article"',
};

/**
 * Represents the Support article dialog shown when a user clicks on a support article link from the Support popover.
 *
 * @augments {BaseContainer}
 */
export class SupportArticleComponent extends BaseContainer {
	/**
	 * Confirms the support article is displayed on screen.
	 *
	 * @returns {Promise<void>} No return value.
	 *
	 */
	async articleDisplayed(): Promise< void > {
		await this.page.waitForSelector( selectors.visitArticleButton );
	}
}
