import { Page, Frame, FrameLocator } from 'playwright';

// Options for Playwright's Frame.click() method.
type ClickOptions = Parameters< Frame[ 'click' ] >[ 1 ];

const panel = 'div.editor-post-publish-panel';
const selectors = {
	// Before publishing
	publishButton: `${ panel } .editor-post-publish-panel__header-publish-button > button`,
	cancelPublishButton: `${ panel } .editor-post-publish-panel__header-cancel-button > button`,

	// After publishing
	postPublishClosePanelButton: `${ panel } button[type="button"]:has(svg[aria-hidden="true"])`, // aria-label changes depending on the UI language used.
	publishedArticleURL: `${ panel } input[readonly]`,
	addNewArticleButton: `${ panel } .post-publish-panel__postpublish-buttons a[href="post-new.php?post_type=post"]`,
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
		// If the publish button in the before publish panel is not found, then
		// perform nothing.
		if ( ( await publishButtonLocator.count() ) === 0 ) {
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
		const locator = this.frameLocator.locator( selectors.publishedArticleURL );
		const publishedURL = ( await locator.getAttribute( 'value' ) ) as string;
		return new URL( publishedURL );
	}

	/**
	 * Clicks on the Add New Page/Post button in the post-publish state.
	 *
	 * @param {ClickOptions} options Options to be forwarded to Frame.click().
	 */
	async addNewArticle( options: ClickOptions = {} ): Promise< void > {
		const locator = this.frameLocator.locator( selectors.addNewArticleButton );
		await locator.click( options );
	}
}
