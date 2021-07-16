import { Frame, Page } from 'playwright';
import { BaseBlock } from '../base-block';

const selectors = {
	block: '.wp-block-coblocks-pricing-table',
	pricing: '.wp-block-coblocks-pricing-table-item__amount',
	gutterControl: 'div[aria-label="Editor settings"] div[aria-label="Gutter"]',
};

/**
 * Represents the Pricing Table coblock.
 */
export class PricingTableBlock extends BaseBlock {
	/**
	 * Enters the price to the side chosen.
	 *
	 * @param {'left'|'right'} side Left or right side of the block.
	 * @param {string} price Price to be entered.
	 * @returns {Promise<void>} No return value.
	 */
	async enterPrice( side: 'left' | 'right', price: string | number ): Promise< void > {
		const index = side === 'left' ? 1 : 2;
		const priceHandler = await this.block.waitForSelector(
			`:nth-match(${ selectors.pricing }, ${ index })`
		);
		await priceHandler.fill( price.toString() );
	}

	/**
	 * Given an appropriate value, select the gutter value on the settings sidebar for Pricing Table block.
	 *
	 * @param {string} value Value to set the gutter to.
	 * @returns {Promise<void>} No return value.
	 */
	async setGutter( value: 'None' | 'Small' | 'Medium' | 'Large' | 'Huge' ): Promise< boolean > {
		const frame = ( await this.block.ownerFrame() ) as Frame;

		const selector = `${ selectors.gutterControl } button[aria-label="${ value }"]`;
		await frame.click( selector );
		return await frame.$eval(
			selector,
			( element ) => element.getAttribute( 'aria-pressed' ) === 'true'
		);
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent( page: Page ): Promise< void > {
		await page.waitForSelector( selectors.pricing );
		await page.waitForSelector( selectors.block );
	}
}
