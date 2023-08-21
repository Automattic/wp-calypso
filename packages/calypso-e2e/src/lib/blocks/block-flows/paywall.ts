import { ParagraphBlock } from '../paragraph-block';
import { BlockFlow, EditorContext, PublishedPostContext } from '.';

const prePaywallBlockText = 'Content everyone can see';
const postPaywallBlockText = 'Content only subscribers can see';

const blockParentSelector = 'div[aria-label="Block: Paywall (beta)"]';

/**
 * Flow for the Paywall block.
 */
export class PaywallFlow implements BlockFlow {
	blockSidebarName = 'Paywall (beta)';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution.
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();

		// Click on the post title, and hit enter.
		// This in effect inserts a new Paragraph block immediate below
		// the title.
		await editorCanvas
			.getByRole( 'textbox', {
				name: 'Add title',
				exact: true,
			} )
			.click();

		// Insert a block that is not behind a paywall.
		await context.page.keyboard.press( 'Enter' );

		await context.editorPage.enterText( prePaywallBlockText );

		// Click on the Paywall block, and hit enter.
		await editorCanvas.getByRole( 'document', { name: 'Block: Paywall' } ).click();

		// Insert a block that is behind a paywall and configure text.
		const postPaywallParagraphHandle = await context.editorPage.addBlockFromSidebar(
			ParagraphBlock.blockName,
			ParagraphBlock.blockEditorSelector
		);
		await postPaywallParagraphHandle.fill( postPaywallBlockText );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Publisher/owner of the post can see everything.
		await context.page.getByText( prePaywallBlockText ).waitFor();
		await context.page.getByText( postPaywallBlockText ).waitFor();
	}
}
