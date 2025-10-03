import {
	labelFormFieldBlock,
	makeSelectorFromBlockName,
	validatePublishedFormFields,
} from './shared';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	labelPrefix: string;
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class ContactFormFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Contact Form';
	blockEditorSelector = makeSelectorFromBlockName( 'Form' );

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// Name and Email are common fields shared amongst all Form patterns.
		// So let's make them unique here!
		await labelFormFieldBlock( context.addedBlockLocator, {
			blockName: 'Name field',
			accessibleLabelName: 'Add label…',
			labelText: this.addLabelPrefix( 'Name field' ),
		} );
		await labelFormFieldBlock( context.addedBlockLocator, {
			blockName: 'Email field',
			accessibleLabelName: 'Add label…',
			labelText: this.addLabelPrefix( 'Email field' ),
		} );
	}

	/**
	 * This flow uses a prefix for labels to make them unique. This function adds that prefix to a label.
	 *
	 * @param {string} label
	 * @returns The label with the prefix added.
	 */
	private addLabelPrefix( label: string ): string {
		return `${ this.configurationData.labelPrefix } ${ label }`;
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email field' ) },
			// This is the default label pulled in by the Contact Form pattern.
			// It's unique-ish and a good validation of that pattern, so we've left it alone.
			{ type: 'textbox', accessibleName: 'Message' },
			// Same with the default text on the submit button.
			{ type: 'button', accessibleName: 'Contact Us' },
		] );
	}
}
