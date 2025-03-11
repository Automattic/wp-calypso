import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedTweetText: string;
}

const blockParentSelector = '[aria-label*="Block: Twitter"]:has-text("Twitter")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	editorTwitterIframe: 'iframe[title="Embedded content from twitter.com"]',
	publishedTwitterIframe: 'iframe[title="X Post"]',
	publishedTwitterBareLink:
		'figure.wp-block-embed-twitter > div.wp-block-embed__wrapper > a[href^="https://twitter.com/automattic/"]',
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

	blockSidebarName = 'Twitter Embed';
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
		// In most cases, the iframe will render, so look for that.
		const iframeTweetLocator = context.page
			.frameLocator( selectors.publishedTwitterIframe )
			.locator( `text=${ this.configurationData.expectedTweetText }` )
			.first();

		// However, sometimes only the bare link renders, so we need to check for that fallback.
		const bareTweetLinkLocator = context.page.locator( selectors.publishedTwitterBareLink ).first();

		await Promise.any( [ iframeTweetLocator.waitFor(), bareTweetLinkLocator.waitFor() ] );
	}
}
