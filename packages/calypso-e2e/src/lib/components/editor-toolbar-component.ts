import { Page, FrameLocator } from 'playwright';

const panel = 'div.interface-interface-skeleton__header';
const selectors = {
	saveDraftButton: `${ panel } button.editor-post-save-draft[aria-disabled="false"]`,
	saveDraftDisabledButton: `${ panel } button.editor-post-saved-state.is-saved[aria-disabled="true"]`,
	switchToDraftButton: `${ panel } button.editor-post-switch-to-draft`,
	publishButton: `${ panel } button.editor-post-publish-button__button[aria-disabled="false"]`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport.
 */
export class EditorToolbarComponent {
	private page: Page;
	private frameLocator: FrameLocator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {FrameLocator} frameLocator Locator of the editor iframe.
	 */
	constructor( page: Page, frameLocator: FrameLocator ) {
		this.page = page;
		this.frameLocator = frameLocator;
	}

	/**
	 * Clicks on the 'Save Draft' button on the editor.
	 *
	 * If the button cannot be clicked, the method short-circuits.
	 */
	async saveDraft(): Promise< void > {
		const saveButtonLocator = this.frameLocator.locator( selectors.saveDraftButton );

		if ( ! saveButtonLocator.waitFor( { timeout: 5 * 1000 } ) ) {
			return;
		}

		await saveButtonLocator.click();

		// Ensure the Save Draft button is disabled after successful save.
		const savedButtonLocator = this.frameLocator.locator( selectors.saveDraftDisabledButton );
		await savedButtonLocator.waitFor();
	}

	/**
	 * Clicks on the primary button to publish the article.
	 *
	 * This is applicable for the following scenarios:
	 * 	- publish of a new article (Publish)
	 * 	- update an existing article (Update)
	 * 	- schedule a post (Schedule)
	 */
	async clickPublish(): Promise< void > {
		const publishButtonLocator = this.frameLocator.locator( selectors.publishButton );
		await publishButtonLocator.click();
	}

	/**
	 * Clicks on the `Switch to Draft` button and unpublish
	 * the article.
	 */
	async switchToDraft(): Promise< void > {
		this.page.once( 'dialog', async ( dialog ) => {
			await dialog.accept();
		} );

		const swithcToDraftLocator = this.frameLocator.locator( selectors.switchToDraftButton );
		await swithcToDraftLocator.click();

		// Publish button will become enabled upon completion.
		const publishButtonLocator = this.frameLocator.locator( selectors.publishButton );
		await publishButtonLocator.waitFor();
	}
}
