import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

const INSTAGRAM_EMBED_TIMEOUT = 20000; // Can take a bit longer to load.

const blockParentSelector = '[aria-label="Block: Embed"]:has-text("Instagram URL")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	embedIframe: `iframe[title="Embedded content from instagram.com"]`,
	instagramIframe: `iframe.instagram-media`,
};

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

	blockSidebarName = 'Instagram';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const embedUrlLocator = editorCanvas.locator( selectors.embedUrlInput );
		await embedUrlLocator.fill( this.configurationData.embedUrl );

		const embedButtonLocator = editorCanvas.locator( selectors.embedButton );
		await embedButtonLocator.click();

		// We should make sure the actual Iframe loads, because it takes a second.
		const instagramIframeLocator = editorCanvas
			.frameLocator( selectors.embedIframe )
			.frameLocator( selectors.instagramIframe )
			.locator( `text=${ this.configurationData.expectedPostText }` )
			.first();

		await instagramIframeLocator.waitFor( { timeout: INSTAGRAM_EMBED_TIMEOUT } );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedPostTextLocator = context.page
			.frameLocator( selectors.instagramIframe )
			.locator( `text=${ this.configurationData.expectedPostText }` )
			.first(); // In case the post text isn't particularly specific, just resolve to the first one!

		await expectedPostTextLocator.waitFor( { timeout: INSTAGRAM_EMBED_TIMEOUT } );
	}
}
