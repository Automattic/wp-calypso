import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedTweetText: string;
}

const blockParentSelector = '[aria-label*="Block: Twitter"]:has-text("Twitter")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	// @todo Remove first option once Gutenberg v18.8.0 is deployed everywhere.
	editorTwitterIframe: `iframe[title="Embedded content from twitter.com"]`,
	publishedTwitterIframe: `iframe[title="X Post"]`,
};

/**
 * Class representing the flow of using a Twitter block in the editor
 */
export class TwitterBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	// @todo Change to "YouTube Embed" once Gutenberg v18.9.0 is deployed everywhere.
	blockSidebarName = /(Twitter Embed|Twitter)/;
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		const urlInputLocator = editorCanvas.locator( selectors.embedUrlInput );
		await urlInputLocator.fill( this.configurationData.embedUrl );

		const embedButtonLocator = editorCanvas.locator( selectors.embedButton );
		await embedButtonLocator.click();

		// We should make sure the actual Iframe loads, because it takes a second.
		const twitterIframeLocator = editorCanvas.locator( selectors.editorTwitterIframe );
		await twitterIframeLocator.waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedTweetLocator = context.page
			.frameLocator( selectors.publishedTwitterIframe )
			.locator( `text=${ this.configurationData.expectedTweetText }` )
			.first(); // May not be specific enough to match only one (and that's okay).
		await expectedTweetLocator.waitFor();
	}
}
