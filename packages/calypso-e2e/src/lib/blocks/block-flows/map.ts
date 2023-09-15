import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	address?: string;
	// Often, the list of locations returned by the Map block is not formatted exactly
	// like the initial input address. We could do fuzzy matching with a third party lib,
	// but that seems excessive - so instead, the caller is expected to supply the expected
	// target text.
	select?: string;
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
	 * Configure the block in the editor with the configuration data from the constructor.
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.addedBlockLocator.scrollIntoViewIfNeeded();
		await context.addedBlockLocator.getByRole( 'button', { name: 'Add marker' } ).waitFor();

		if ( this.configurationData.address && this.configurationData.select ) {
			// Note: there are at least two providers of Maps data on macOS:
			// mapbox and Apple Maps.
			// The locators differ between the two, but the data entry portion
			// should work the same between the two services.

			// Enter the supplied address.
			const editorParent = await context.editorPage.getEditorParent();
			await editorParent
				.getByRole( 'textbox', { name: 'Add a marker' } )
				.type( this.configurationData.address, { delay: 5 } );

			// Wait for the popover and click on the first matching item.
			await editorParent
				.locator( '.components-popover' )
				.getByRole( 'listbox' )
				.filter( { hasText: this.configurationData.select } )
				.first()
				.click();
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
