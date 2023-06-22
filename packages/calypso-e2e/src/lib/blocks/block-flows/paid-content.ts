import { envVariables } from '../../..';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	subscriberTitle: string;
	subscriberText: string;
}

const blockParentSelector = '[aria-label="Block: Paid Content"]';
const selectors = {
	subscriberViewButton: 'button:has-text("Subscriber View")',
	subscriberHeader: '[aria-label="Block: Subscriber View"] [aria-label="Block: Heading"]',
	subscriberParagraph: '[aria-label="Block: Subscriber View"] [aria-label="Paragraph block"]',
};

/**
 * Class representing the flow of using a Paid Content block in the editor.
 */
export class PaidContentBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Paid Content';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorParent = await context.editorPage.getEditorParent();

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewport hides the Subscriber/Guest view
			// into a pseudo-dropdown.
			await editorParent.getByRole( 'button', { name: 'Change view' } ).click();
		}

		const subscriberViewButtonLocator = editorParent.locator( selectors.subscriberViewButton );
		await subscriberViewButtonLocator.click();

		const subscriberHeaderLocator = editorParent.locator( selectors.subscriberHeader );
		await subscriberHeaderLocator.fill( this.configurationData.subscriberTitle );

		const subscriberParagraphLocator = editorParent.locator( selectors.subscriberParagraph );
		await subscriberParagraphLocator.fill( this.configurationData.subscriberText );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Since we're viewing as the publishing user, we should see the subscriber version of the content.
		const expectedTitle = context.page.locator(
			`text="${ this.configurationData.subscriberTitle }"`
		);
		await expectedTitle.waitFor();

		const expectedText = context.page.locator(
			`text="${ this.configurationData.subscriberText }"`
		);
		await expectedText.waitFor();
	}
}
