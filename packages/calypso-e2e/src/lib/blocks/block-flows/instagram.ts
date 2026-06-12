import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

const selectors = {
	editorInstagramIframe: 'iframe[title="Embedded content from www.instagram.com"]',
	publishedInstagramIframe: 'iframe.instagram-media-rendered',
	publishedInstagramBlockquote:
		'blockquote.instagram-media:has-text("View this post on Instagram")',
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

		await editorCanvas.locator( selectors.editorInstagramIframe ).waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const renderedIframeLocator = context.page
			.locator( selectors.publishedInstagramIframe )
			.first();
		const bareBlockquoteLocator = context.page
			.locator( selectors.publishedInstagramBlockquote )
			.first();

		await Promise.any( [ renderedIframeLocator.waitFor(), bareBlockquoteLocator.waitFor() ] );
	}
}
