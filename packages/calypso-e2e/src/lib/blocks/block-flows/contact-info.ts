import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	email: string;
	phoneNumber: string;
}

const blockParentSelector = '[aria-label="Block: Contact Info"]';
const selectors = {
	emailTextarea: `${ blockParentSelector } textarea[aria-label=Email]`,
	phoneNumberTextarea: `${ blockParentSelector } textarea[aria-label="Phone number"]`,
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
		const emailLocator = context.editorLocator.locator( selectors.emailTextarea );
		await emailLocator.fill( this.configurationData.email );

		const phoneNumberLocator = context.editorLocator.locator( selectors.phoneNumberTextarea );
		await phoneNumberLocator.fill( this.configurationData.phoneNumber );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const numericOnlyPhoneNumber = this.configurationData.phoneNumber.replace( /\D/g, '' );

		const expectedEmailLinkLocator = context.page.locator(
			`[href="mailto:${ this.configurationData.email }"]`
		);
		await expectedEmailLinkLocator.waitFor();

		const expectedPhoneLinkLocator = context.page.locator(
			`[href="tel:${ numericOnlyPhoneNumber }"]`
		);
		await expectedPhoneLinkLocator.waitFor();
	}
}
