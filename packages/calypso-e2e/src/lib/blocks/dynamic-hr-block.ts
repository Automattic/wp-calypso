/**
 * Internal dependencies
 */
import { BaseBlock } from '../base-block';

import { Page } from 'playwright';

const selectors = {
	block: '.wp-block-coblocks-dynamic-hr',
};

/**
 * Represents the Dynamic HR coblock.
 */
export class DynamicHRBlock extends BaseBlock {
	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.isVisible( selectors.block );
	}
}
