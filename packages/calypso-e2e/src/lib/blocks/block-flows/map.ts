import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	address: string;
}

const blockParentSelector = '[aria-label="Block: Map"]';

/**
 * Class representing the flow of using a Tiled Gallery block in the editor.
 */
export class MapFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Map';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', { name: 'Block: Map' } );

		// Enter the supplied address.
		await editorCanvas
			.getByRole( 'textbox', { name: 'Add a marker' } )
			.fill( this.configurationData.address );

		// Wait for the popover.
		await editorCanvas.locator( '.components-popover' ).getByRole( 'listbox' ).waitFor();
		await context.page.keyboard.press( 'Enter' );

		await block.locator( '.wp-block-jetpack-map-marker' ).waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.getByRole( 'main' ).locator( '.wp-block-jetpack-map' ).waitFor();
	}
}
