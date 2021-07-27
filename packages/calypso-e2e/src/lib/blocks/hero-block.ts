import { Page } from 'playwright';
import { BaseBlock } from '../base-block';

const selectors = {
	block: '.wp-block-coblocks-hero',
	heading: '[aria-label="Block: Heading"]',
};

/**
 * Represents the Hero coblock.
 */
export class HeroBlock extends BaseBlock {
	// Static properties.
	static blockName = 'Hero';

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
