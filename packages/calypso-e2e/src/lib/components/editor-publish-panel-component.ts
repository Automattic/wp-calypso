import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const panel = 'div.editor-post-publish-panel';
const selectors = {
	// Before publishing
	publishButton: `${ panel } .editor-post-publish-panel__header-publish-button > button`,
	cancelPublishButton: `${ panel } .editor-post-publish-panel__header-cancel-button > button`,

	// After publishing
	postPublishClosePanelButton: `${ panel } div.editor-post-publish-panel__header > button`, // aria-label changes depending on the UI language used.
	publishedArticleURL: `${ panel } input[readonly]`,
};

/**
 * Represents an instance of the WordPress.com Editor's publish checklist & post-publish panel.
 */
export class EditorPublishPanelComponent {
	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Returns the root element of the toolbar.
	 */
	async getRoot() {
		const editorParent = await this.editor.parent();

		return editorParent.getByRole( 'region', { name: 'Editor publish' } );
	}

	/**
	 * Checks whether the Editor Publish panel is open.
	 *
	 * This method will wait up to 5 seconds for the panel to be visible.
	 *
	 * @returns {Promise<boolean>} True if panel is visible. False otherwise.
	 */
	async panelIsOpen(): Promise< boolean > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( `${ panel }:visible` );
		try {
			await locator.waitFor( { timeout: 5 * 1000 } );
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Closes the panel regardless of the state of the panel.
	 *
	 * There exist two potential states for the panel:
	 * 	- prior to publishing;
	 * 	- post publishing;
	 *
	 * The selector used for each state differ; however both have the same end result,
	 * that is to dismiss the component represented by EditorPublishPanelComponent.
	 */
	async closePanel(): Promise< void > {
		// Construct a comma-separated list of CSS selectors so that one of them will match.
		if ( ! ( await this.panelIsOpen() ) ) {
			return;
		}
		const editorParent = await this.editor.parent();
		const selector = `${ selectors.cancelPublishButton }:visible, ${ selectors.postPublishClosePanelButton }:visible`;
		const locator = editorParent.locator( selector );
		await locator.click();
	}

	/* Pre-publish checklist*/

	/**
	 * Publish or schedule the article.
	 */
	async publish(): Promise< void > {
		const editorParent = await this.editor.parent();
		const publishButtonLocator = editorParent.locator( selectors.publishButton );

		// Check if the button is able to be triggered before proceeding.
		// We limit the timeout to fix local testings.
		try {
			await publishButtonLocator.waitFor( { state: 'attached', timeout: 5 * 1000 } );
		} catch {
			return;
		}

		if ( ! ( await publishButtonLocator.count() ) ) {
			return;
		}

		await publishButtonLocator.click();
	}

	/* Post-publish state */

	/**
	 * Returns the URL of the published article.
	 *
	 * @returns {URL} URL to the published article.
	 */
	async getPublishedURL(): Promise< URL > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.publishedArticleURL );
		const publishedURL = ( await locator.getAttribute( 'value' ) ) as string;
		return new URL( publishedURL );
	}
}
