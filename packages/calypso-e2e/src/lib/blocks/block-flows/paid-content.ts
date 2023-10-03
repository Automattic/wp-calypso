import { envVariables } from '../../..';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	subscriberTitle: string;
	subscriberText: string;
}

const blockParentSelector = '[aria-label="Block: Paid Content"]';

/**
 * Class representing the flow of using a Paid Content block in the editor.
 */
export class PaidContentBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Paid Content';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const block = editorCanvas.getByRole( 'document', { name: 'Block: Paid Content' } );

		// The Guest View will load by default. Wait for this view to fully render.
		await block.getByRole( 'document', { name: 'Block: Guest View' } ).waitFor();

		// Using the Block Toolbar, change to the Subscriber view.
		// The exact steps differ between the viewports.
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewport hides the Subscriber/Guest buttons into a dropdown.
			await context.editorPage.clickBlockToolbarButton( { name: 'Change view' } );
			await context.editorPage.selectFromToolbarPopover( 'Subscriber View' );
		} else {
			// Block toolbar for the desktop viewport shows both as a top-level button.
			await context.editorPage.clickBlockToolbarButton( { name: 'Subscriber View' } );
		}

		// Verify the Subscriber version of the block is now loaded.
		await block.getByRole( 'document', { name: 'Block: Subscriber View' } ).waitFor();

		// Fill the title and text for Subscriber view.
		await block
			.getByRole( 'document', { name: 'Block: Heading' } )
			.fill( this.configurationData.subscriberTitle );
		await block
			.getByRole( 'document', { name: /Paragraph/ } )
			.fill( this.configurationData.subscriberText );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Since we're viewing as the publishing user, we should see the subscriber version of the content.
		await context.page
			.getByRole( 'heading', {
				name: this.configurationData.subscriberTitle,
			} )
			.waitFor();

		await context.page
			.getByRole( 'paragraph' )
			.filter( { hasText: this.configurationData.subscriberText } )
			.waitFor();
	}
}
