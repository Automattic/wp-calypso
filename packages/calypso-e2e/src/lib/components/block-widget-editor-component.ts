import { Page } from 'playwright';

const selectors = {
	editor: '#widgets-editor',

	welcomeModalDismissButton: 'button[aria-label="Close dialog"]',
	welcomeTourDismissButton: 'button[aria-label="Close Tour"]',

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
	 * Dismiss any welcome modals that appear.
	 *
	 * These include:
	 * 	- Welcome modal
	 * 	- Welcome Tour
	 */
	async dismissModals(): Promise< void > {
		await this.page.waitForLoadState( 'networkidle' );

		const locators = [
			this.page.locator( selectors.welcomeModalDismissButton ),
			this.page.locator( selectors.welcomeTourDismissButton ),
		];

		for await ( const locator of locators ) {
			try {
				// Whether Welcome Tour appears is not deterministic.
				// If it is not present, exit early.
				if ( ( await locator.count() ) === 0 ) {
					return;
				}
				await locator.click( { timeout: 10 * 1000 } );
			} catch {
				//noop
			}
		}
	}
}
