import { Page, Frame, FrameLocator } from 'playwright';

// Options for Playwright's Frame.click() method.
type ClickOptions = Parameters< Frame[ 'click' ] >[ 1 ];

const panel = 'div.editor-post-publish-panel';
const selectors = {
	// Pre-publish
	publishButton: `${ panel } button.editor-post-publish-button__button[aria-disabled=false]`,
	cancelPublishButton: `${ panel } div.editor-post-publish-panel__header-cancel-button > button`,

	// Post-publish
	postPublishClosePanelButton: `${ panel } button[type="button"]:has(svg[aria-hidden="true"])`, // aria-label changes depending on the UI language used.
	viewArticleButton: `${ panel } a:text-matches("View (Post|Page)", "i")`,
	articleURLField: `${ panel } input[readonly]`,
	addNewButton: `${ panel } .post-publish-panel__postpublish-buttons > a`,
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
		const publishButtonLocator = await this.frameLocator.locator( selectors.publishButton );
		await publishButtonLocator.click();
	}

	/* Post-publish state */

	/**
	 * Returns the URL of the published article.
	 *
	 * @returns {string} URL to the published article.
	 */
	async getPublishedURL(): Promise< string > {
		const locator = this.frameLocator.locator( selectors.articleURLField );
		const publishedURL = ( await locator.getAttribute( 'value' ) ) as string;
		return publishedURL;
	}

	/**
	 * Clicks on the Add New Page/Post button in the post-publish state.
	 *
	 * @param {ClickOptions} options Options to be forwarded to Frame.click().
	 */
	async addNew( options: ClickOptions = {} ): Promise< void > {
		const locator = this.frameLocator.locator( selectors.addNewButton );
		await locator.click( options );
	}
}
