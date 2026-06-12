import {
	ExpectedFormField,
	disableFormEmailNotifications,
	labelFormFieldBlock,
	makeSelectorFromBlockName,
	validatePublishedFormFields,
} from './shared';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	labelPrefix: string;
}

interface ValidationData {
	otherExpectedFields: ExpectedFormField[];
}

/**
 * Class representing the flow of using an block in the editor.
 */
export class FormPatternsFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private validationData: ValidationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 * @param {ValidationData} validationData data with which to validate the block
	 */
	constructor( configurationData: ConfigurationData, validationData: ValidationData ) {
		this.configurationData = configurationData;
		this.validationData = validationData;
	}

	blockSidebarName = 'Form';
	blockTestName = 'Form (Patterns)';
	blockEditorSelector = makeSelectorFromBlockName( 'Form' );

	private skippedDueToCFM = false;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		// With Central Form Management, forms are created from the dashboard — the
		// "Browse form patterns" variation picker no longer appears in the editor.
		await context.page.waitForTimeout( 2 * 1000 );
		const browseButton = context.addedBlockLocator.getByRole( 'button', {
			name: 'Browse form patterns',
		} );
		if ( ! ( await browseButton.isVisible( { timeout: 3000 } ).catch( () => false ) ) ) {
			this.skippedDueToCFM = true;
			return;
		}

		await this.addFormPattern( context );

		// Adding the pattern unfortunately wipes out the old parent Form block and replaces it with a new one.
		// So we have to grab a new parent locator ourselves instead of relying on the old on in the context.
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const newParentBlockId = await editorCanvas
			// Handle old and new block patterns.
			.locator(
				'[aria-label="Block: Form"].is-selected, [aria-label="Block: Group"].is-selected [aria-label="Block: Form"]'
			)
			.getAttribute( 'id' );
		const newParentBlockLocator = editorCanvas.locator( `#${ newParentBlockId }` );

		await disableFormEmailNotifications( context.page, newParentBlockLocator );

		// We now have to double-click to edit the pattern-added form.
		// (or click an "Edit section" sidebar button, but this is easier)
		await newParentBlockLocator.dblclick( { force: true } );

		// Email is a common field shared amongst all Form patterns.
		// So let's make it unique here!
		await labelFormFieldBlock( newParentBlockLocator, {
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
	 * Opens the form pattern modal and adds the form pattern.
	 *
	 * @param {EditorContext} context Editor context object.
	 */
	private async addFormPattern( context: EditorContext ) {
		// The wait already happened in configure() before checking for the button.
		await context.addedBlockLocator.getByRole( 'button', { name: 'Browse form patterns' } ).click();

		const editorParent = await context.editorPage.getEditorParent();
		await editorParent
			.getByRole( 'dialog', { name: 'Choose a pattern' } )
			.getByRole( 'option' )
			.first()
			// These patterns can load in quite slowly, messing with animation wait checks, so let's give extra time.
			.click( { timeout: 30 * 1000 } );
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
		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email field' ) },
			...this.validationData.otherExpectedFields,
		] );
	}
}
