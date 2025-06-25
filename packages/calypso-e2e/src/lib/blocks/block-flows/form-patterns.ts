import {
	ExpectedFormField,
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

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
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

		// Name and Email are common fields shared amongst all Form patterns.
		// So let's make them unique here!
		await labelFormFieldBlock( newParentBlockLocator, {
			blockName: 'Name field',
			accessibleLabelName: 'Add label…',
			labelText: this.addLabelPrefix( 'Name field' ),
		} );
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
		// Okay, this timeout wait is gross, but we really don't have any other options here.
		// For whatever reason, if you try to open the forms pattern modal too quickly, it will get dismissed.
		// After a lot of testing, there is no network request or anything reliable in the DOM that we can key off of.
		// And a loop design where you try to launch and see if you were successful is also flaky, because the check will
		// pass sometimes and then the modal will still get dismissed.
		// There must be some slow-ish Editor rerender that is dismissing the dialog.
		// This wait, although "against the rules", has proved to be the most reliable approach so far.
		await context.page.waitForTimeout( 2 * 1000 );
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
		await validatePublishedFormFields( context.page, [
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Name field' ) },
			{ type: 'textbox', accessibleName: this.addLabelPrefix( 'Email field' ) },
			...this.validationData.otherExpectedFields,
		] );
	}
}
