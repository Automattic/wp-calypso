/**
 * Internal dependencies
 */
import { BaseBlock } from '../base-block';

import { Page } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-click-to-tweet',
	tweetContent: '.wp-block-coblocks-click-to-tweet__text',
};

/**
 * Represents the Click to Tweet coblock.
 */
export class ClicktoTweetBlock extends BaseBlock {
	/**
	 * Given a text string, enters the text into the main tweet body.
	 *
	 * @param {string} text Content to be tweeted.
	 * @returns {Promise<void>} No return value.
	 */
	async enterTweetContent( text: string ): Promise< void > {
		const textArea = await this.block.waitForSelector( selectors.tweetContent );
		await textArea.fill( text );
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.isVisible( selectors.block );
	}
}
