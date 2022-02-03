import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	email: string;
	phoneNumber: string;
}

const blockParentSelector = '[aria-label="Block: Contact Info"]';
const selectors = {
	emailTextArea: 'textarea[aria-label=Email]',
	phoneNumberTextArea: 'textarea[aria-label="Phone number"]',
};

/**
 * Class representing the flow of using a Contact Info block in the editor.
 */
export class ContactInfoBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Contact Info';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.editorIframe.fill( selectors.emailTextArea, this.configurationData.email );
		await context.editorIframe.fill(
			selectors.phoneNumberTextArea,
			this.configurationData.phoneNumber
		);
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const numericOnlyPhoneNumber = this.configurationData.phoneNumber.replace( /\D/g, '' );

		await context.page.waitForSelector( `[href="mailto:${ this.configurationData.email }"]` );
		await context.page.waitForSelector( `[href="tel:${ numericOnlyPhoneNumber }"]` );
	}
}
