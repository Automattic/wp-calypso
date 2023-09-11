import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	query: string;
}

const blockParentSelector = '[aria-label="Block: GIF"]';

/**
 * Class representing the flow of using a GIF block in the editor.
 */
export class GifFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'GIF';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', { name: 'Block: GIF' } );

		await block.getByRole( 'textbox' ).fill( this.configurationData.query );
		await block.getByRole( 'button', { name: 'Search' } ).click();

		await block
			.frameLocator( `iframe[src="${ this.configurationData.query }"]` )
			.locator( '.embed' )
			.waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page
			.getByRole( 'main' )
			.frameLocator( `iframe[src="${ this.configurationData.query }"]` )
			.getByRole( 'document' )
			.waitFor();
	}
}
