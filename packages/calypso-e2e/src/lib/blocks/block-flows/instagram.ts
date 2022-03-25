import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

const blockParentSelector = '[aria-label="Block: Embed"]:has-text("Instagram URL")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	editorInstagramIframe: `iframe[title="Embedded content from instagram.com"]`,
	publishedInstagramIframe: `iframe.instagram-media`,
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
		const embedUrlLocator = context.editorLocator.locator( selectors.embedUrlInput );
		await embedUrlLocator.fill( this.configurationData.embedUrl );

		const embedButtonLocator = context.editorLocator.locator( selectors.embedButton );
		await embedButtonLocator.click();

		// We should make sure the actual Iframe loads, because it takes a second.
		const instagramIframeLocator = context.editorLocator.locator( selectors.editorInstagramIframe );
		await instagramIframeLocator.waitFor();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const expectedPostTextLocator = context.page
			.frameLocator( selectors.publishedInstagramIframe )
			.locator( `text=${ this.configurationData.expectedPostText }` );
		await expectedPostTextLocator.waitFor();
	}
}
