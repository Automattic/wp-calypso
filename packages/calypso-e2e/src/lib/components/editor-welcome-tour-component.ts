import { Page, Locator } from 'playwright';

/**
 * Represents the welcome tour that shows in a popover when the editor loads.
 */
export class EditorWelcomeTourComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Force dismisses the welcome tour using Redux state/actions.
	 *
	 * @see {@link https://github.com/Automattic/wp-calypso/issues/57660}
	 */
	async forceDismissWelcomeTour(): Promise< void > {
		// Locator API doesn't have waitForFunction yet. We need a Frame for now.
		const editorElement = await this.editor.elementHandle();
		const editorFrame = await editorElement?.ownerFrame();
		if ( ! editorFrame ) {
			return;
		}

		await editorFrame.waitForFunction(
			async () =>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await ( window as any ).wp.data
					.select( 'automattic/wpcom-welcome-guide' )
					.isWelcomeGuideStatusLoaded()
		);

		await editorFrame.waitForFunction( async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const actionPayload = await ( window as any ).wp.data
				.dispatch( 'automattic/wpcom-welcome-guide' )
				.setShowWelcomeGuide( false );

			return actionPayload.show === false;
		} );
	}
}
