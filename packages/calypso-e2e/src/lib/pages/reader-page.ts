import { Page } from 'playwright';

const selectors = {
	// Reader main stream
	readerCard: '.reader-post-card',
	visitSiteLink: '.reader-visit-link',
	actionButton: ( action: 'Share' | 'Comment' ) =>
		`.reader-post-actions__item:has-text("${ action }")`,

	// Post
	placeholder: '.is-placeholder',
	commentTextArea: '.comments__form textarea',
	commentSubmitButton: '.comments__form button:text("Send")',
	comment: ( commentText: string ) => `div:text( '${ commentText }' )`,
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
	 * This method supports either a 1-indexed number or partial or full string matching.
	 *
	 * 	index: 1-indexed value, starting from top of page.
	 * 	text: partial or full text matching of text contained in a reader entry. If multiple
	 * 		matches are found,  the first match is used.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {number} param0.index n-th post to view on the reader page. 1-indexed.
	 * @param {string} param0.text Text string to match.
	 * @throws {Error} If neither index or text are specified.
	 */
	async visitPost( { index, text }: { index?: number; text?: string } = {} ): Promise< void > {
		let selector = '';

		if ( index ) {
			selector = `:nth-match(${ selectors.readerCard }, ${ index })`;
		} else if ( text ) {
			selector = `${ selectors.readerCard }:has-text("${ text }")`;
		} else {
			throw new Error( 'Unable to select and visit post - specify one of index or text.' );
		}

		await Promise.all( [
			this.page.waitForSelector( selectors.placeholder, { state: 'hidden' } ),
			this.page.waitForNavigation( { waitUntil: 'networkidle' } ),
			this.page.click( selector ),
		] );
	}

	/**
	 * Submits a given string of text as comment on a post.
	 *
	 * This method requires that current page is on an article that supports comments.
	 * Otherwise, this method will throw.
	 *
	 * @param {string} comment Text of the comment.
	 */
	async comment( comment: string ): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.commentTextArea );
		await this.page.evaluate(
			( element: SVGElement | HTMLElement ) => element.scrollIntoView(),
			elementHandle
		);
		await this.page.fill( selectors.commentTextArea, comment );
		await Promise.all( [
			this.page.waitForLoadState( 'networkidle' ),
			this.page.click( selectors.commentSubmitButton ),
		] );
		await this.page.waitForSelector( selectors.comment( comment ) );
	}
}
