import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	name: string;
	price: number;
	email: string;
}

const blockParentSelector = 'div[aria-label="Block: Pay with PayPal"]';
const selectors = {
	// Editor
	name: `${ blockParentSelector } input[placeholder="Item name"]`,
	currency: `${ blockParentSelector } .simple-payments__field-currency .components-select-control__input`,
	price: `${ blockParentSelector } .simple-payments__field-price .components-text-control__input`,
	email: `${ blockParentSelector } input[placeholder="Email"]`,
};

/**
 * Class representing the flow of using an Pay with Paypal block in the editor
 */
export class PayWithPaypalBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Pay with Paypal';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const nameLocator = context.editorLocator.locator( selectors.name );
		await nameLocator.fill( this.configurationData.name );

		const priceLocator = context.editorLocator.locator( selectors.price );
		await priceLocator.fill( this.configurationData.price.toString() );

		const emailLocator = context.editorLocator.locator( selectors.email );
		await emailLocator.fill( this.configurationData.email );

		// If the post is not saved as draft, the Pay with Paypal block is not rendered in the published post.
		await context.editorPage.saveDraft();
		// Leave site? popup cannot be prevented when publishing.
		// See https://github.com/Automattic/wp-calypso/issues/60014.
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedNameLocator = context.page.locator( `:text("${ this.configurationData.name }")` );
		expectedNameLocator.waitFor();

		const expectedPriceLocator = context.page.locator(
			`:has-text("${ this.configurationData.price.toString() }")`
		);
		expectedPriceLocator.waitFor();
	}
}
