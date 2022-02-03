import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	buttonText: string;
}

const blockParentSelector = '[aria-label="Block: Payments"]';
const selectors = {
	editableButtonText: `${ blockParentSelector } [role=textbox]`,
};

/**
 * Class representing the flow of using a Contact Info block in the editor.
 */
export class PaymentsBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Payments';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// On mobile, you need to focus the parent block first, then the sub-block. This is also desktop safe.
		await context.editorIframe.click( blockParentSelector );
		// We can't use the 'fill' method because it's not a real textarea :(
		await context.editorIframe.click( selectors.editableButtonText );
		await context.editorIframe.type(
			selectors.editableButtonText,
			this.configurationData.buttonText
		);
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Because Stripe isn't connected to this WordPress.com account, we shouldn't see this block published.
		if (
			await context.page.isVisible( `button:has-text("${ this.configurationData.buttonText }")` )
		) {
			throw new Error(
				'Payments button should not be visible on published post without Stripe connection'
			);
		}
	}
}
