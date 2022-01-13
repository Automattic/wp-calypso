import { Page, ElementHandle, Frame } from 'playwright';

const selectors = {
	// Published page
	block: '.jetpack-simple-payments-wrapper',
	iframe: 'iframe[title="PayPal"]',
	paypalButton: '[aria-label="Pay with PayPal"]',
	visaButton: '[data-card="visa"]',
	mastercardButton: '[data-card="mastercard"]',
	amexButton: '[data-card="amex"]',

	// Block in editor
	name: 'input[placeholder="Item name"]',
	description: 'textarea[aria-label="Describe your item in a few words"]',
	currency: '.simple-payments__field-currency .components-select-control__input',
	price: '.simple-payments__field-price .components-text-control__input',
	allowMultiple: '.simple-payments__field-multiple .components-form-toggle__input',
	email: 'input[placeholder="Email"]',
};

interface PaypalPaymentDetails {
	name: string;
	description?: string;
	currency: string;
	price: number;
	allowMultiple?: false;
	email: string;
}

/**
 * Represents the File block.
 */
export class PayWithPaypalBlock {
	static blockName = 'Pay with Paypal';
	static blockEditorSelector = '[aria-label="Block: Pay with PayPal"]';
	block: ElementHandle;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {ElementHandle} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( block: ElementHandle ) {
		this.block = block;
	}

	/**
	 * Fills in details of the block.
	 *
	 * @param {PaypalPaymentDetails} details Object holding details to be entered.
	 */
	async setPaymentDetails( details: PaypalPaymentDetails ): Promise< void > {
		await this.setName( details );
		await this.setCurrency( details );
		await this.setPrice( details );
		await this.setEmail( details );
	}

	/**
	 * Fills in the name.
	 *
	 * @param {PaypalPaymentDetails} details Object holding details to be entered.
	 */
	private async setName( details: PaypalPaymentDetails ): Promise< void > {
		const nameInput = await this.block.waitForSelector( selectors.name );
		await nameInput.fill( details.name );
	}

	/**
	 * Sets the currency.
	 *
	 * @param {PaypalPaymentDetails} details Object holding details to be entered.
	 */
	private async setCurrency( details: PaypalPaymentDetails ): Promise< void > {
		const currencySelect = await this.block.waitForSelector( selectors.currency );
		await currencySelect.selectOption( { value: details.currency } );
	}

	/**
	 * Fills in the price.
	 *
	 * @param {PaypalPaymentDetails} details Object holding details to be entered.
	 */
	private async setPrice( details: PaypalPaymentDetails ): Promise< void > {
		const priceInput = await this.block.waitForSelector( selectors.price );
		await priceInput.fill( details.price.toString() );
	}

	/**
	 * Fills in the email.
	 *
	 * @param {PaypalPaymentDetails} details Object holding details to be entered.
	 */
	private async setEmail( details: PaypalPaymentDetails ): Promise< void > {
		const emailInput = await this.block.waitForSelector( selectors.email );
		await emailInput.fill( details.email );
	}

	/* Published methods */

	/**
	 * Given the a target, click on the button corresponding to the target on the
	 * published page.
	 *
	 * @param {Page} page Page object.
	 * @param {string} paymentType Target payment type.
	 */
	static async clickPaymentButton(
		page: Page,
		paymentType: 'PayPal' | 'Visa' | 'Mastercard' | 'Amex'
	): Promise< void > {
		const targetButton = `${ paymentType.toLowerCase() }Button`;

		const iframeHandler = await page.waitForSelector( selectors.iframe );
		const frame = ( await iframeHandler.contentFrame() ) as Frame;
		await frame.click( Object( selectors )[ targetButton ] );
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
		const iframeHandler = await page.waitForSelector( selectors.iframe );
		const frame = ( await iframeHandler.contentFrame() ) as Frame;

		await frame.waitForSelector( selectors.paypalButton );
		await frame.waitForSelector( selectors.visaButton );
		await frame.waitForSelector( selectors.mastercardButton );
		await frame.waitForSelector( selectors.amexButton );

		for await ( const content of contents ) {
			await page.waitForSelector( `${ selectors.block } :text(" ${ content.toString() }")` );
		}
	}
}
