import { Frame, Page } from 'playwright';
// import { gutterValues, gutterValuesArray } from '../../types';
import { BaseBlock } from '../base-block';

// Workaround to get a type from predefined array.
// See https://stackoverflow.com/a/59857409.
const gutterValuesArray = [ 'None', 'Small', 'Medium', 'Large', 'Huge' ] as const;
export type gutterValues = typeof gutterValuesArray[ number ];

const selectors = {
	block: '.wp-block-coblocks-pricing-table',
	pricing: '.wp-block-coblocks-pricing-table-item__amount',
	gutterControl: 'div[aria-label="Editor settings"] div[aria-label="Gutter"]',
};

/**
 * Represents the Pricing Table coblock.
 */
export class PricingTableBlock extends BaseBlock {
	// Static properties.
	static blockName = 'Pricing Table';
	static gutterValues = gutterValuesArray;

	/**
	 * Enters the price to the side chosen.
	 *
	 * @param {1|2} column Left or right column of the pricing table.
	 * @param {string|number} price Price to be entered.
	 * @returns {Promise<void>} No return value.
	 */
	async enterPrice( column: 1 | 2, price: string | number ): Promise< void > {
		const priceHandler = await this.block.waitForSelector(
			`:nth-match(${ selectors.pricing }, ${ column })`
		);
		await priceHandler.fill( price.toString() );
	}

	/**
	 * Given an appropriate value, select the gutter value on the settings sidebar for Pricing Table block.
	 *
	 * @param {string} value Value to set the gutter to.
	 * @returns {Promise<void>} No return value.
	 */
	async setGutter( value: gutterValues ): Promise< void > {
		const frame = ( await this.block.ownerFrame() ) as Frame;

		const selector = `${ selectors.gutterControl } button[aria-label="${ value }"]`;
		await frame.click( selector );
		const elementHandle = await frame.waitForSelector( selector );
		// waitForFunction will do its own validation, so no need to return the value
		// to caller for a check.
		await frame.waitForFunction(
			( element: any ) => element.ariaPressed === 'true',
			elementHandle
		);
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 * @param {(string|number)} contents Contents used to validate the block.
	 * @returns {Promise<void>} No return value.
	 */
	static async validatePublishedContent(
		page: Page,
		contents: ( string | number )[]
	): Promise< void > {
		for await ( const content of contents ) {
			await page.waitForSelector( `${ selectors.block } :text("${ content.toString() }")` );
		}
	}
}
