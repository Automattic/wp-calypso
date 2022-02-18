import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	phoneNumber: number | string;
	buttonText?: string;
}

// The parent selector for the block changes between mobile and desktop viewport.
const blockParentSelector =
	'div[aria-label="Block: Send A Message"], div[aria-label="Block: WhatsApp Button"]';
const selectors = {
	// Editor
	settings: 'button[aria-label="WhatsApp Button Settings"]',
	phoneNumberInput: 'input[placeholder="Your phone number…"]',
	buttonLabel: 'a.whatsapp-block__button',

	// Published
	block: 'div.wp-block-jetpack-whatsapp-button',
};

/**
 * Class representing the flow of using an block in the editor.
 */
export class WhatsAppButtonFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'WhatsApp Button';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		if ( this.configurationData.buttonText ) {
			await context.editorIframe.fill( selectors.buttonLabel, this.configurationData.buttonText );
		}

		await context.editorIframe.click( selectors.settings );
		await context.editorIframe.fill(
			selectors.phoneNumberInput,
			this.configurationData.phoneNumber.toString()
		);
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.waitForSelector( selectors.block );
		if ( this.configurationData.buttonText ) {
			await context.page.waitForSelector(
				`${ selectors.block } :text("${ this.configurationData.buttonText }")`
			);
		}
	}
}
