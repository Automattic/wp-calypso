import { BlockFlow, EditorContext, PublishedPostContext } from '..';
import envVariables from '../../../env-variables';

interface ConfigurationData {
	phoneNumber: number | string;
	buttonText?: string;
}

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
	blockEditorSelector: string;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
		// The parent selector for the block changes between mobile and desktop viewport.
		this.blockEditorSelector =
			envVariables.VIEWPORT_NAME === 'desktop'
				? 'div[aria-label="Block: WhatsApp Button"]'
				: 'div[aria-label="Block: Send A Message"]';
	}

	blockSidebarName = 'WhatsApp Button';

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		if ( this.configurationData.buttonText ) {
			const buttonLabelLocator = context.editorLocator.locator( selectors.buttonLabel );
			await buttonLabelLocator.fill( this.configurationData.buttonText );
		}

		const settingsLocator = context.editorLocator.locator( selectors.settings );
		await settingsLocator.click();

		const phoneInputLocator = context.editorLocator.locator( selectors.phoneNumberInput );
		await phoneInputLocator.fill( this.configurationData.phoneNumber.toString() );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const blockLocator = context.page.locator( selectors.block );
		await blockLocator.waitFor();

		if ( this.configurationData.buttonText ) {
			const expectedButtonTextLocator = context.page.locator(
				`${ selectors.block } :text("${ this.configurationData.buttonText }")`
			);
			await expectedButtonTextLocator.waitFor();
		}
	}
}
