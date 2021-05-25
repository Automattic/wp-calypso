/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { ElementHandle, Frame, Page } from 'playwright';
import { BaseContainer } from '../base-container';

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 *
 * @augments {BaseContainer}
 */
export class GutenbergEditorPage extends BaseContainer {
	frame!: Frame;

	// Page and Frame related selectors.
	editorSelector = 'div.main.main-column.calypsoify.is-iframe > iframe';

	// Editor element selectors.
	titleSelector = `.editor-post-title__input`;
	appenderSelector = '.block-editor-default-block-appender';
	paragraphSelector = 'p.block-editor-rich-text__editable:first-of-type';

	// Publish flow selectors.
	firstPublishButtonSelector = '.editor-post-publish-panel__toggle';
	secondPublishButtonSelector =
		'.editor-post-publish-panel__header-publish-button button.editor-post-publish-button';
	snackBarNoticeSelector = '.components-snackbar';
	snackBarNoticeLinkSelector = '.components-snackbar__content a';

	/**
	 * Constructs an instance of this object.
	 *
	 * @param {Page} page The page where actions take place.
	 */
	constructor( page: Page ) {
		super( page, 'div.main.main-column.calypsoify.is-iframe > iframe' );
	}

	/**
	 * Overrides the function of same name defined in the base class.
	 * This ensures the iframe containing the editor is is fully loaded prior to
	 * continuing with the test.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		const handle = ( await this.page.$( this.editorSelector ) ) as ElementHandle;
		this.frame = ( await handle.contentFrame() ) as Frame;
	}

	/**
	 * Enters text into the title block.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 */
	async enterTitle( title: string ): Promise< void > {
		await this.frame.click( this.titleSelector );
		await this.frame.fill( this.titleSelector, title );
	}

	/**
	 * Enters text into the body.
	 *
	 * @param {string} text Text to be entered into the body.
	 * @returns {Promise<void>} No return value.
	 */
	async enterText( text: string ): Promise< void > {
		await this.frame.click( this.appenderSelector );
		await this.frame.fill( this.paragraphSelector, text );
	}

	/**
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {Promise<void} No return value.
	 */
	async publish( visit = false ): Promise< void > {
		await this.frame.click( this.firstPublishButtonSelector );
		await this.frame.click( this.secondPublishButtonSelector );

		await this.frame.waitForSelector( this.snackBarNoticeSelector );

		if ( visit ) {
			await this._visitPublishedPost();
		}
	}

	/**
	 * Visits the published post or page.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _visitPublishedPost() {
		await Promise.all( [
			this.frame.click( this.snackBarNoticeLinkSelector ),
			this.page.waitForNavigation(),
		] );
	}
}
