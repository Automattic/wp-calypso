import { Locator } from 'playwright';
import { envVariables } from '../../..';
import { makeSelectorFromBlockName, validatePublishedFormFields } from './shared';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	prompt: string;
}

interface ValidationData {
	sampleInputLabel: string;
	submitButtonText: string;
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class FormAiFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private validationData: ValidationData | undefined;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Form';
	blockEditorSelector = makeSelectorFromBlockName( 'Form' );

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		let aiInputParentLocator: Locator;
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, it's attached to the editor block toolbar, which is apart from the block DOM.
			aiInputParentLocator = await context.editorPage.getEditorParent();
		} else {
			// On desktop, it's within the block DOM node.
			aiInputParentLocator = context.addedBlockLocator;
		}

		const aiInputReadyLocator = aiInputParentLocator.getByPlaceholder(
			'Ask Jetpack AI to create your form'
		);
		const aiInputBusyLocator = aiInputParentLocator.getByRole( 'textbox', {
			name: 'Creating your form. Please wait a few moments.',
			disabled: true,
		} );
		const sendButtonLocator = aiInputParentLocator.getByRole( 'button', {
			name: 'Send request',
		} );

		await aiInputReadyLocator.fill( this.configurationData.prompt );
		await sendButtonLocator.click();
		await aiInputBusyLocator.waitFor();
		await aiInputReadyLocator.waitFor( { timeout: 30 * 1000 } );

		// Grab a first sample input label and submit button text to use for validation.
		this.validationData = {
			sampleInputLabel: await this.getFirstTextFieldLabel( context ),
			submitButtonText: await this.getSubmitButtonText( context ),
		};
	}

	/**
	 * Gets the label text for the first text-input field in the form in the editor.
	 *
	 * @param {EditorContext} context The editor context object.
	 * @returns {Promise<string>} The label text of the first text-input field.
	 */
	private async getFirstTextFieldLabel( context: EditorContext ): Promise< string > {
		return await context.addedBlockLocator
			.getByRole( 'document', {
				// The form will always have one of these input fields, and they are easy
				// to validate later in the editor with accessible checks!
				name: /^Block: (Text Input|Name|Email|Multi-line Text) Field$/,
			} )
			.locator( 'label' )
			.first()
			.innerText();
	}

	/**
	 * Gets the innerText on the submit button on the form in the editor.
	 *
	 * @param {EditorContext} context The editor context object.
	 * @returns {Promise<string>} The innerText of the submit button.
	 */
	private async getSubmitButtonText( context: EditorContext ): Promise< string > {
		return await context.addedBlockLocator
			.getByRole( 'document', {
				name: 'Block: Button',
			} )
			.first()
			.innerText();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		if ( ! this.validationData ) {
			throw new Error( 'Unable to find fields in the editor from the AI form.' );
		}

		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.validationData.sampleInputLabel },
			{ type: 'button', accessibleName: this.validationData.submitButtonText },
		] );
	}
}
