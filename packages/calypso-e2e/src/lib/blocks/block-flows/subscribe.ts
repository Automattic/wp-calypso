import { BlockFlow, PublishedPostContext } from '..';

const blockParentSelector = '[aria-label="Block: Subscribe"]';
const selectors = {
	emailInput: 'input[name=email]',
	subscribeButton: 'button:has-text("Subscribe")',
};

/**
 * Class representing the flow of using a Subscription Form block in the editor.
 */
export class SubscribeFlow implements BlockFlow {
	blockSidebarName = 'Subscribe';
	blockEditorSelector = blockParentSelector;

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Is there an interactive email field?
		const emailInputLocator = context.page.locator( selectors.emailInput );
		await emailInputLocator.fill( 'foo@example.com' );
		// And a subscribe button?
		const subscribeButtonLocator = context.page.locator( selectors.subscribeButton );
		await subscribeButtonLocator.waitFor(); // Don't click - we don't want a real subscription!
	}
}
