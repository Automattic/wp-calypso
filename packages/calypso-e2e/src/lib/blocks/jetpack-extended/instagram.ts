import { Page } from 'playwright';
import { BlockComponent } from '..';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

const blockParentSelector = '[aria-label="Block: Embed"]:has-text("Instagram URL")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	publishedInstagramIframe: `iframe.instagram-media`,
};

/**
 *
 */
export class InstagramBlock implements BlockComponent {
	private page: Page;
	private configurationData: ConfigurationData;

	blockName = 'Instagram';

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page the Playwright page
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( page: Page, configurationData: ConfigurationData ) {
		this.page = page;
		this.configurationData = configurationData;
	}

	/**
	 *
	 */
	async configure(): Promise< void > {
		await this.page.fill( selectors.embedUrlInput, this.configurationData.embedUrl );
	}

	/**
	 *
	 */
	async validateAfterPublish(): Promise< void > {
		throw new Error( 'Method not implemented.' );
	}
}
