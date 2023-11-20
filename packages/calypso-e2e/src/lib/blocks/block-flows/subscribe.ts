import { BlockFlow, PublishedPostContext } from '.';

const editorBlockParentSelector = '[aria-label="Block: Subscribe"]';

/**
 * Class representing the flow of using a Subscription Form block in the editor.
 */
export class SubscribeFlow implements BlockFlow {
	blockSidebarName = 'Subscribe';
	blockEditorSelector = editorBlockParentSelector;

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// Is there an interactive email field?
		const emailInputLocator = context.page
			.getByRole( 'main' )
			.getByRole( 'textbox', { name: 'Type your email' } );

		// The email input field only appears if not logged in, or if logged in user is not subscribed already.
		if ( await emailInputLocator.isVisible() ) {
			await emailInputLocator.fill( 'foo@example.com' );
		}

		// And a subscribe button?
		const subscribeButtonLocator = context.page
			.getByRole( 'main' )
			.getByRole( 'button', { name: 'Subscribe' } );
		await subscribeButtonLocator.waitFor(); // Don't click - we don't want a real subscription!
	}
}
