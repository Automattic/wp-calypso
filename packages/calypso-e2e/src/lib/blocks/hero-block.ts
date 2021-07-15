/**
 * Internal dependencies
 */
import { BaseBlock } from '../base-block';

import { Page } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-hero',
	heading: '[aria-label="Block: Heading"]',
};

/**
 * Represents the Hero coblock.
 */
export class HeroBlock extends BaseBlock {
	/**
	 * Enters text into the heading of the Hero block.
	 *
	 * @param {string} text Text to be entered to the heading.
	 * @returns {Promise<void>} No return value.
	 */
	async enterHeading( text: string ): Promise< void > {
		const headingHandle = await this.block.waitForSelector( selectors.heading );
		await headingHandle.fill( text );
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.waitForSelector( selectors.block );
	}
}
