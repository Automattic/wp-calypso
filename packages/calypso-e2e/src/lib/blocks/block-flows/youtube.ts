import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedVideoTitle: string;
}

const blockParentSelector = '[aria-label*="Block: YouTube"]:has-text("YouTube")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	editorYouTubeIframe: 'iframe[title="Embedded content from www.youtube.com"]',
	publishedYouTubeIframe: `iframe.youtube-player`,
};

/**
 * Class representing the flow of using a YouTube block in the editor.
 */
export class YouTubeBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block.
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'YouTube Embed';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor.
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		const urlInputLocator = editorCanvas.locator( selectors.embedUrlInput );
		await urlInputLocator.fill( this.configurationData.embedUrl );

		const embedButtonLocator = editorCanvas.locator( selectors.embedButton );
		await embedButtonLocator.click();

		// We should make sure the actual Iframe loads, because it takes a second.
		const youTubeIframeLocator = editorCanvas.locator( selectors.editorYouTubeIframe );
		await youTubeIframeLocator.waitFor();
	}

	/**
	 * Validate the block in the published post.
	 *
	 * @param context The current context for the published post at the point of test execution.
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedVideoTitleLocator = context.page
			.frameLocator( selectors.publishedYouTubeIframe )
			.locator( `text=${ this.configurationData.expectedVideoTitle }` )
			.first(); // The video title may be multiple places in the frame.

		await expectedVideoTitleLocator.waitFor();
	}
}
