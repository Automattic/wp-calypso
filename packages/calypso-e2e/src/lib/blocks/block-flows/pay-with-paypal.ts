import { BlockFlow, EditorContext, PublishedPostContext } from '.';

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

	// Published
	publishedName: ( name: string ) => `main .jetpack-simple-payments-title :text("${ name }")`, // 'main' needs to be specified due to the debug elements
	publishedPrice: ( price: number ) => `main .jetpack-simple-payments-price :text("${ price }")`, // 'main' needs to be specified due to the debug elements
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

	blockSidebarName = 'Pay with PayPal';
	blockEditorSelector = blockParentSelector;

	// @todo the `configure` below should also support a target: SiteType option as it wraps the `EditorPage`
	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const nameLocator = editorCanvas.locator( selectors.name );
		await nameLocator.fill( this.configurationData.name );

		const priceLocator = editorCanvas.locator( selectors.price );
		await priceLocator.fill( this.configurationData.price.toString() );

		const emailLocator = editorCanvas.locator( selectors.email );
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
		// Use quotes in selector to narrow down to an exact text node match for specificity.
		const expectedNameLocator = context.page.locator(
			selectors.publishedName( this.configurationData.name )
		);
		expectedNameLocator.waitFor();

		const expectedPriceLocator = context.page.locator(
			selectors.publishedPrice( this.configurationData.price )
		);
		expectedPriceLocator.waitFor();
	}
}
