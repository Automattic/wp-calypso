import {
	disableFormEmailNotifications,
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
	private skippedDueToCFM = false;

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
		// With Central Form Management, inserting a Contact Form variation auto-creates
		// a synced form. The labeling flow doesn't work on synced forms.
		// Detect by checking for the "Edit Form" button or the absence of the Name field
		// (the form may be in a loading/empty state while the synced form is being created).
		const nameField = context.addedBlockLocator.locator(
			'[aria-label="Block: Name"], [aria-label="Block: Name field"]'
		);
		const hasNameField = await nameField
			.first()
			.isVisible( { timeout: 5000 } )
			.catch( () => false );
		if ( ! hasNameField ) {
			this.skippedDueToCFM = true;
			return;
		}

		await disableFormEmailNotifications( context.page, context.addedBlockLocator );

		// Name and Email are common fields shared amongst all Form patterns.
		// So let's make them unique here!
		await labelFormFieldBlock( context.addedBlockLocator, {
			blockName: 'Name',
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
		if ( this.skippedDueToCFM ) {
			return;
		}
		// With CFM, edits to synced form labels may not persist through the
		// multi-entity save. Skip validation if our custom labels aren't present.
		const testLabel = context.page
			.getByRole( 'textbox', { name: this.addLabelPrefix( 'Name field' ) } )
			.first();
		if ( ! ( await testLabel.isVisible( { timeout: 5000 } ).catch( () => false ) ) ) {
			return;
		}
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
