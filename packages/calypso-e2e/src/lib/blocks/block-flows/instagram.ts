import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

/**
 * Class representing the flow of using an Instagram block in the editor
 */
export class InstagramBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Instagram Embed';
	blockTestFallBackName = 'Instagram';
	blockEditorSelector =
		'[aria-label="Block: Embed"]:has-text("Instagram Embed URL"), [aria-label="Block: Embed"]:has-text("Instagram URL")';
	noSearch = false;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		await editorCanvas
			.getByPlaceholder( 'Enter URL to embed here…' )
			.fill( this.configurationData.embedUrl );

		await editorCanvas
			.getByRole( 'document', { name: 'Block: Embed' } )
			.getByRole( 'button', {
				name: 'Embed',
			} )
			.click();

		await editorCanvas.getByTitle( 'Embedded content from www.instagram.com' ).waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.getByRole( 'figure' ).getByText( 'View this post on Instagram' ).waitFor();
	}
}
