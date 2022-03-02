import { Page, FrameLocator } from 'playwright';

const panel = 'div.editor-post-publish-panel';
const selectors = {
	// Before publishing
	publishButton: `${ panel } .editor-post-publish-panel__header-publish-button > button`,
	cancelPublishButton: `${ panel } .editor-post-publish-panel__header-cancel-button > button`,

	// After publishing
	postPublishClosePanelButton: `${ panel } button[type="button"]:has(svg[aria-hidden="true"])`, // aria-label changes depending on the UI language used.
	publishedArticleURL: `${ panel } input[readonly]`,
};

/**
 * Represents an instance of the WordPress.com Editor's publish checklist & post-publish panel.
 */
export class EditorPublishPanelComponent {
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
	 * Checks whether the Editor Publish panel is open.
	 *
	 * This method will wait up to 5 seconds for the panel to be visible.
	 *
	 * @returns {Promise<boolean>} True if panel is visible. False otherwise.
	 */
	async panelIsOpen(): Promise< boolean > {
		const locator = this.frameLocator.locator( `${ panel }:visible` );
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
		const selector = `${ selectors.cancelPublishButton }, ${ selectors.postPublishClosePanelButton }`;
		const locator = this.frameLocator.locator( selector );
		await locator.click();
	}

	/* Pre-publish checklist*/

	/**
	 * Publish or schedule the article.
	 */
	async publish(): Promise< void > {
		const publishButtonLocator = this.frameLocator.locator( selectors.publishButton );
		await publishButtonLocator.click();
	}

	/* Post-publish state */

	/**
	 * Returns the URL of the published article.
	 *
	 * @returns {URL} URL to the published article.
	 */
	async getPublishedURL(): Promise< URL > {
		const locator = this.frameLocator.locator( selectors.publishedArticleURL );
		const publishedURL = ( await locator.getAttribute( 'value' ) ) as string;
		return new URL( publishedURL );
	}
}
