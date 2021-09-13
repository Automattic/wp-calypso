import { Page } from 'playwright';

const selectors = {
	// Reader main stream
	readerCard: '.reader-post-card',
	visitSiteLink: '.reader-visit-link',
	actionButton: ( action: 'Share' | 'Comment' ) =>
		`.reader-post-actions__item:has(span:has-text("${ action }"))`,

	commentTextArea: '.comments__form textarea',
	commentSubmitButton: '.comments__form button:text("Send")',
	commentContentLocator: ( commentText: string ) =>
		`.comments__comment :text( '${ commentText }' )`,
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
	}

	/**
	 * Get the URL of the latest post in Reader
	 *
	 * @returns {Promise<string>} String of URL for latest post.
	 */
	async siteOfLatestPost(): Promise< string > {
		const href = await this.page.getAttribute( selectors.visitSiteLink, 'href' );
		return new URL( href ? href : '' ).host;
	}

	/**
	 * Visits a post in the Reader.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {number} param0.index n-th post to view on the reader page. 1-indexed.
	 */
	async visitPost( { index }: { index?: number } = {} ): Promise< void > {
		let selector = '';
		if ( index ) {
			selector = `:nth-match(${ selectors.readerCard }, ${ index })`;
		}

		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selector ) ] );
	}

	/**
	 * Sets and submits comment on latest post
	 *
	 * @param {string} comment Text of the comment.
	 * @returns {Promise<void>} No return value.
	 */
	async comment( comment: string ): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.commentTextArea );
		await elementHandle.scrollIntoViewIfNeeded();
		await this.page.fill( selectors.commentTextArea, comment );
		await this.page.click( selectors.commentSubmitButton );
		await this.page.waitForSelector( selectors.commentContentLocator( comment ) );
	}
}
