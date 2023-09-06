import { ParagraphBlock } from '../paragraph-block';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	prePaywallText: string;
	postPaywallText: string;
}

const blockParentSelector = 'div[aria-label="Block: Paywall"]';

/**
 * Flow for the Paywall block.
 */
export class PaywallFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	blockSidebarName = 'Paywall';
	blockEditorSelector = blockParentSelector;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		// Insert two text blocks, and populate with
		// pre and post-paywall text.
		const prePaywallParagraphHandle = await context.editorPage.addBlockFromSidebar(
			ParagraphBlock.blockName,
			ParagraphBlock.blockEditorSelector,
			{ noSearch: true }
		);
		await prePaywallParagraphHandle.fill( this.configurationData.prePaywallText );
		const postPaywallParagraphHandle = await context.editorPage.addBlockFromSidebar(
			ParagraphBlock.blockName,
			ParagraphBlock.blockEditorSelector,
			{ noSearch: true }
		);
		await postPaywallParagraphHandle.fill( this.configurationData.postPaywallText );

		// Click on the Paywall block, and hit enter.
		await editorCanvas.getByRole( 'document', { name: 'Block: Paywall' } ).click();

		// Move the Paywall block down, slotting it between
		// the two Paragraph blocks.
		await context.editorPage.moveBlockDown();
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Publisher/owner of the post can see everything.
		await context.page
			.getByRole( 'main' )
			.getByText( this.configurationData.prePaywallText )
			.waitFor();
		await context.page
			.getByRole( 'main' )
			.getByText( this.configurationData.postPaywallText )
			.waitFor();

		// Unrelated user sees a paywall.
		// Verify in a new browser context.

		const publishedPostURL = context.page.url();

		const newPage = await ( await browser.newContext() ).newPage();
		await newPage.goto( publishedPostURL, { waitUntil: 'domcontentloaded' } );

		await newPage.getByRole( 'main' ).getByText( this.configurationData.prePaywallText ).waitFor();
		await newPage
			.getByRole( 'main' )
			.getByText( this.configurationData.postPaywallText )
			.waitFor( { state: 'detached' } );
	}
}
