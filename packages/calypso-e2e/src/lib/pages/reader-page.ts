import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	// Reader main stream
	readerCard: '.reader-post-card',
	streamPlaceholder: 'span.reader__placeholder-text',
	visitSiteLink: '.reader-visit-link',
	actionButton: ( action: 'Share' | 'Comment' ) =>
		`.reader-post-actions__item:has-text("${ action }")`,

	// Post
	relatedPostsPlaceholder: '.is-placeholder',
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
	 * Opens the Reader page.
	 *
	 * Example {@link https://wordpress.com/read}
	 */
	async visit(): Promise< Response | null > {
		return await this.page.goto( getCalypsoURL( 'read' ) );
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
	 * This method supports partial or full string matching.
	 *
	 * 	text: partial or full text matching of text contained in a reader entry. If multiple
	 * 		matches are found,  the first match is used.
	 *
	 * @param {string} text Text string to match.
	 * @returns {Promise<string>} URL of the visited post.
	 * @throws {Error} If neither index or text are specified.
	 */
	async visitPost( text: string ): Promise< string > {
		// Wait for main reader stream to populate.
		await this.page.locator( selectors.streamPlaceholder ).waitFor( { state: 'hidden' } );

		await this.page.getByText( text ).click();
		return this.page.url();
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
		// Wait for related posts card to generate.
		await this.page.waitForSelector( selectors.relatedPostsPlaceholder, { state: 'hidden' } );

		// Force scroll.
		const elementHandle = await this.page.waitForSelector( selectors.commentTextArea );
		await this.page.evaluate(
			( element: SVGElement | HTMLElement ) => element.scrollIntoView(),
			elementHandle
		);
		await this.page.fill( selectors.commentTextArea, comment );

		await Promise.all( [
			this.page.waitForResponse(
				( response ) => response.status() === 200 && response.url().includes( 'new?' )
			),
			this.page.click( selectors.commentSubmitButton ),
		] );
	}
}
