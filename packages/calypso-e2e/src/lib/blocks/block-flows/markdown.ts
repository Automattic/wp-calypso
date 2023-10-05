import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	text: string;
}
interface ValidationData {
	expectedText: string;
	// Has to be one of the aria roles supported by the locator.getByRole call.
	expectedRole: 'heading' | 'paragraph';
}

/**
 * Represents the flow of using the Markdown block.
 */
export class MarkdownFlow implements BlockFlow {
	private configurationData: ConfigurationData;
	private validationData: ValidationData;

	/**
	 * Constructs an instance of this block flow with data to be used when
	 * configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData Configuration data for the block.
	 */
	constructor( configurationData: ConfigurationData, validationData: ValidationData ) {
		this.configurationData = configurationData;
		this.validationData = validationData;
	}

	blockSidebarName = 'Markdown';
	blockEditorSelector = 'div[aria-label="Block: Markdown"]';

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of
	 * test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const textarea = context.addedBlockLocator.getByRole( 'textbox', { name: 'Markdown' } );

		await textarea.fill( this.configurationData.text );

		await context.editorPage.clickBlockToolbarButton( { name: 'Preview' } );
		await textarea.waitFor( { state: 'hidden' } );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at
	 * the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page
			.getByRole( this.validationData.expectedRole, {
				name: this.validationData.expectedText,
				exact: true,
			} )
			.waitFor();
	}
}
