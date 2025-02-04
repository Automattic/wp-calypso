import { Page, ElementHandle } from 'playwright';
import { EditorComponent } from '../components';

const selectors = {
	block: '.wp-block-coblocks-pricing-table',
	pricing: '.wp-block-coblocks-pricing-table-item__amount',
	gutterControl: 'div[aria-label="Editor settings"] div[aria-label="Gutter"]',
};

/**
 * Represents the Pricing Table coblock.
 */
export class PricingTableBlock {
	// Static properties.
	static blockName = 'Pricing Table';
	static blockEditorSelector = '[aria-label="Block: Pricing Table"]';
	private editor: EditorComponent;
	block: ElementHandle;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 * @param {ElementHandle} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( page: Page, block: ElementHandle ) {
		this.block = block;
		this.editor = new EditorComponent( page );
	}

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
	 * @param {string} name Name of the gutter preset.
	 * @param {number} value Value of the gutter for the "Custom" preset (Atomic).
	 * @returns {Promise<void>} No return value.
	 */
	async setGutter( name: string, value?: number ): Promise< void > {
		const editorParent = await this.editor.parent();
		const buttonSelector = `${ selectors.gutterControl } button[aria-label="${ name }"]`;

		await editorParent.locator( buttonSelector ).click();
		await editorParent.locator( `${ buttonSelector }[aria-pressed="true"]` ).waitFor();

		if ( name === 'Custom' && value !== undefined ) {
			const valueInput = editorParent.locator(
				'input[type="number"]:below(button[aria-label="Custom"])'
			);
			await valueInput.fill( String( value ) );
		}
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
