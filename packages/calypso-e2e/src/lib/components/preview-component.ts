import { Page } from 'playwright';

const selectors = {
	previewPane: '.web-preview',

	// Actions on pane
	closeButton: 'button[aria-label="Close preview"]',
	activateButton: 'text=Activate',
};

/**
 * Component representing the site published preview component.
 */
export class PreviewComponent {
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
	 * Waits for the preview pane to be visible.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async previewReady(): Promise< void > {
		await this.page.waitForSelector( selectors.previewPane );
	}

	/**
	 * Close the theme preview pane.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async closePreview(): Promise< void > {
		await this.page.click( selectors.closeButton );
	}
}
