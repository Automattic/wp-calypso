import { BlockFlow, EditorContext, PublishedPostContext } from '..';
import { EditorPage } from '../..';

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
		await context.editorIframe.fill( selectors.name, this.configurationData.name );
		await context.editorIframe.fill( selectors.price, this.configurationData.price.toString() );
		await context.editorIframe.fill( selectors.email, this.configurationData.email );

		// If the post is not saved as draft, the Pay with Paypal block is not rendered in the published post.
		const editorPage = new EditorPage( context.page );
		await editorPage.saveDraft();
		// Leave site? popup cannot be prevented when publishing.
		// See https://github.com/Automattic/wp-calypso/issues/60014.
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.waitForSelector( `:text("${ this.configurationData.name }")` );
		await context.page.waitForSelector(
			`:has-text("${ this.configurationData.price.toString() }")`
		);
	}
}
