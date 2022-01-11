import { Page } from 'playwright';

const selectors = {
	editor: '#widgets-editor',

	welcomeModalDismissButton: 'button[aria-label="Close dialogue"]',

	addBlockButton: 'button[aria-label="Add block"]',
	blockSearch: 'input[placeholder="Search"]',
};

/**
 * Component for the block-based Widget editor in Appearance > Widgets.
 */
export class BlockWidgetEditorComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Dismiss the Welcome to Block Widgets modal.
	 *
	 * Note that this is not the same as the Welcome Tour, which is identical to the tour
	 * modal shown in the Gutenberg editor.
	 */
	async dismissWelcomeModal(): Promise< void > {
		const locator = this.page.locator( selectors.welcomeModalDismissButton );
		// Only click if the locator resolves to an element.
		if ( ( await locator.count() ) > 0 ) {
			await locator.click();
		}

		await this.page.waitForFunction(
			async () =>
				await ( window as any ).wp.data
					.select( 'automattic/wpcom-welcome-guide' )
					.isWelcomeGuideStatusLoaded()
		);

		await this.page.waitForFunction( async () => {
			const actionPayload = await ( window as any ).wp.data
				.dispatch( 'automattic/wpcom-welcome-guide' )
				.setShowWelcomeGuide( false );

			return actionPayload.show === false;
		} );
	}
}
