import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	address: string;
}

const blockParentSelector = '[aria-label="Block: Map"]';

/**
 * Class representing the flow of using a Map block in the editor.
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

		// Enter the supplied address.
		const editorParent = await context.editorPage.getEditorParent();
		await editorParent.getByPlaceholder( 'Add a marker' ).fill( this.configurationData.address );

		const mapkitBlock = await editorParent.locator( '[data-map-provider=mapkit]' );

		await editorParent.locator( '.components-popover' ).getByRole( 'listbox' ).waitFor();
		await context.page.keyboard.press( 'Enter' );

		// Wait for the popover.
		if ( ! mapkitBlock ) {
			// Skipping this for Mapkit, since Mapkit renders the the markers in a shadow DOM.
			// TODO: Figure out how to select things inside the shadow DOM with a locator.
			const block = editorCanvas.getByRole( 'document', { name: 'Block: Map' } );
			await block.locator( '.wp-block-jetpack-map-marker' ).waitFor();
		}
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
