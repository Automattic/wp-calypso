import { BlockFlow, EditorContext, PublishedPostContext } from '..';

interface ConfigurationData {
	subscriberTitle: string;
	subscriberText: string;
}

const blockParentSelector = '[aria-label="Block: Premium Content"]';
const selectors = {
	subscriberViewButton: 'button:has-text("Subscriber View")',
	subscriberHeader: '[aria-label="Block: Subscriber View"] [aria-label="Block: Heading"]',
	subscriberParagraph: '[aria-label="Block: Subscriber View"] [aria-label="Paragraph block"]',
};

/**
 * Class representing the flow of using a Contact Info block in the editor.
 */
export class PremiumContentBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Premium Content';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.editorIframe.click( selectors.subscriberViewButton );
		await context.editorIframe.fill(
			selectors.subscriberHeader,
			this.configurationData.subscriberTitle
		);
		await context.editorIframe.fill(
			selectors.subscriberParagraph,
			this.configurationData.subscriberText
		);
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.waitForSelector( `text="${ this.configurationData.subscriberTitle }"` );
		await context.page.waitForSelector( `text="${ this.configurationData.subscriberText }"` );
	}
}
