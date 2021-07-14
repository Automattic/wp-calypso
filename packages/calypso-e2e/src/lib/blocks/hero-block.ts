/**
 * Internal dependencies
 */
import { BaseBlock } from '../base-block';

import { Page } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-hero',
};

/**
 * Represents the Hero coblock.
 */
export class HeroBlock extends BaseBlock {
	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.waitForSelector( selectors.block );
	}
}
