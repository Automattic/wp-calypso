import { Frame } from 'playwright';
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
		await context.editorIframe.fill( selectors.embedUrlInput, this.configurationData.embedUrl );
		await context.editorIframe.click( selectors.embedButton );
		// We should make sure the actual Iframe loads, because it takes a second.
		await context.editorIframe.waitForSelector( selectors.editorInstagramIframe );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		const instagramIframeElement = await context.page.waitForSelector(
			selectors.publishedInstagramIframe
		);
		const instagramIframeHandle = ( await instagramIframeElement.contentFrame() ) as Frame;
		await instagramIframeHandle.waitForSelector(
			`text=${ this.configurationData.expectedPostText }`
		);
	}
}
