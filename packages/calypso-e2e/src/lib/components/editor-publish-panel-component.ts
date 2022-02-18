import { Page, Frame } from 'playwright';

const panel = 'div.editor-post-publish-panel';
const selectors = {
	// Pre-publish
	publishButton: `${ panel } button.editor-post-publish-button__button[aria-disabled=false]`,
	cancelPublishButton: `${ panel } div.editor-post-publish-panel__header-cancel-button > button`,

	// Post-publish
	postPublishClosePanelButton: `${ panel } button(type="button"]:has(svg[aria-hidden="true"])`, // aria-label changes depending on the UI language used.
	viewArticleButton: `${ panel } a:text-matches("View (Post|Page)", "i")`,
	articleURLField: `${ panel } input[readonly]`,
};

/**
 * Represents an instance of the WordPress.com Editor's publish checklist & post-publish panel.
 */
export class EditorPublishPanelComponent {
	private page: Page;
	private frame: Frame;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Frame} frame The edfitor iframe.
	 */
	constructor( page: Page, frame: Frame ) {
		this.page = page;
		this.frame = frame;
	}

	/**
	 * Publish or schedule the article.
	 *
	 * @returns {URL} URL to the published article.
	 */
	async publish(): Promise< URL > {
		await this.frame.click( selectors.publishButton );

		return await this.getPublishedURL();
	}

	/**
	 * Returns the URL of the published article.
	 *
	 * @returns {URL} URL to the published article.
	 */
	async getPublishedURL(): Promise< URL > {
		const locator = this.frame.locator( selectors.articleURLField );
		const publishedURL = ( await locator.getAttribute( 'value' ) ) as string;
		return new URL( publishedURL );
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
		const locator = this.frame.locator( selector );
		await locator.click();
	}
}
