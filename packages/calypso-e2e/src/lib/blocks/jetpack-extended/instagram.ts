import { Frame, Page } from 'playwright';
import { BlockFlow, EditorContext } from '..';

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
 *
 */
export class InstagramBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Instagram';
	blockEditorSelector = '[aria-label="Block: Embed"]';

	/**
	 * @param {EditorContext} editorContext The current editor context at a given point in test execution
	 */
	async configure( editorContext: EditorContext ): Promise< void > {
		await editorContext.editorIframe.fill(
			selectors.embedUrlInput,
			this.configurationData.embedUrl
		);
		await editorContext.editorIframe.click( selectors.embedButton );
		// We should make sure the actual Iframe loads, because it takes a second.
		await editorContext.editorIframe.waitForSelector( selectors.editorInstagramIframe );
	}

	/**
	 * @param page Playwright page
	 */
	async validateAfterPublish( page: Page ): Promise< void > {
		const instagramIframeElement = await page.waitForSelector( selectors.publishedInstagramIframe );
		const instagramIframeHandle = ( await instagramIframeElement.contentFrame() ) as Frame;
		await instagramIframeHandle.waitForSelector(
			`text=${ this.configurationData.expectedPostText }`
		);
	}
}
