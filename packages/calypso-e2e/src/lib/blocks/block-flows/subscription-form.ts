import { BlockFlow, EditorContext, PublishedPostContext } from '..';

const blockParentSelector = '[aria-label="Block: Subscription Form"]';
const selectors = {
	emailInput: 'input[name=email]',
	subscribeButton: 'button:has-text("Subscribe")',
};

/**
 * Class representing the flow of using a Subscription Form block in the editor.
 */
export class SubscriptionFormBlockFlow implements BlockFlow {
	blockSidebarName = 'Subscription Form';
	blockEditorSelector = blockParentSelector;

	// TODO: Delete this post-rebase
	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		await context.page.waitForSelector( 'foo' );
		return;
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Is there an interactive email field?
		await context.page.fill( selectors.emailInput, 'foo@example.com' );
		// And a subscribe button?
		await context.page.waitForSelector( selectors.subscribeButton );
	}
}
