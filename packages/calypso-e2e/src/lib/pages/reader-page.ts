import { Page } from 'playwright';

const selectors = {
	readerPageLocator: '.reader__content',
	readerVisitLink: '.reader-visit-link',
	shareButtonLocator: '.reader-share__button',
	firstComboCardPostLocator: '.reader-combined-card__post-title-link',
	siteContentLocator: '.site-selector__sites .site__content',
	commentButtonLocator: '.comment-button',
	commentTextAreaLocator: '.comments__form textarea',
	commentSubmitLocator: '.comments__form button:text("Send")',
	commentContentLocator: ( commentText: string ) =>
		`.comments__comment-content :text( '${ commentText }' )`,
};

/**
 * Page representing the Reader Page.
 */
export class ReaderPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.verifyReaderPage();
	}

	/**
	 * Verifies that we are actually on the Reader Page
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async verifyReaderPage(): Promise< void > {
		await this.page.waitForSelector( selectors.readerPageLocator );
	}

	/**
	 * Get the URL of the latest post in Reader
	 *
	 * @returns {Promise<string>} String of URL for latest post.
	 */
	async siteOfLatestPost(): Promise< string > {
		const href = await this.page.getAttribute( selectors.readerVisitLink, 'href' );
		return new URL( href ? href : '' ).host;
	}

	/**
	 * Share latest post in Reader
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async shareLatestPost(): Promise< void > {
		await this.page.click( selectors.shareButtonLocator );
		await this.page.click( selectors.siteContentLocator );
	}

	/**
	 * Sets and submits comment on latest post
	 *
	 * @param {string} comment Text of the comment.
	 * @returns {Promise<void>} No return value.
	 */
	async commentOnLatestPost( comment: string ): Promise< void > {
		await this.page.click( selectors.commentButtonLocator );
		await this.page.fill( selectors.commentTextAreaLocator, comment );
		await this.page.click( selectors.commentSubmitLocator );
	}

	/**
	 * Wait for the comment with the specified text to display.
	 *
	 * @param {string} comment Text of the comment.
	 * @returns {Promise<void>} No return value.
	 */
	async waitForCommentToAppear( comment: string ): Promise< void > {
		await this.page.waitForSelector( selectors.commentContentLocator( comment ) );
	}
}
