/**
 * Internal dependencies
 */

/**
 * Type dependencies
 */
import { ElementHandle, Frame, Page } from 'playwright';
import { BaseContainer } from '../base-container';

const selectors = {
	editorFrameSelector: 'div.main.main-column.calypsoify.is-iframe > iframe',

	// Selectors within the editor.
	titleSelector: '.editor-post-title__input',
	appenderSelector: '.block-editor-default-block-appender',
	paragraphSelector: 'p.block-editor-rich-text__editable:first-of-type',

	// Top bar selectors.
	headerPublishButtonSelector: '.editor-post-publish-panel__toggle',

	// Publish pane selectors (including post-publish).
	publishPaneSelector: '.editor-post-publish-panel',
	publishPaneButtonSelector:
		'.editor-post-publish-panel__header-publish-button button.editor-post-publish-button',
	publishPaneViewPostSelector: 'text=View Post',
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 *
 * @augments {BaseContainer}
 */
export class GutenbergEditorPage extends BaseContainer {
	frame!: Frame;

	/**
	 * Constructs an instance of this object.
	 *
	 * @param {Page} page The page where actions take place.
	 */
	constructor( page: Page ) {
		super( page, selectors.editorFrameSelector );
	}

	/**
	 * Overrides the function of same name defined in the base class.
	 * This ensures the iframe containing the editor is is fully loaded prior to
	 * continuing with the test.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _postInit(): Promise< void > {
		const handle = ( await this.page.$( selectors.editorFrameSelector ) ) as ElementHandle;
		this.frame = ( await handle.contentFrame() ) as Frame;
	}

	/**
	 * Enters text into the title block.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 */
	async enterTitle( title: string ): Promise< void > {
		await this.frame.click( selectors.titleSelector );
		await this.frame.fill( selectors.titleSelector, title );
	}

	/**
	 * Enters text into the body.
	 *
	 * @param {string} text Text to be entered into the body.
	 * @returns {Promise<void>} No return value.
	 */
	async enterText( text: string ): Promise< void > {
		await this.frame.click( selectors.appenderSelector );
		await this.frame.fill( selectors.paragraphSelector, text );
	}

	/**
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {Promise<void} No return value.
	 */
	async publish( { visit = false }: { visit?: boolean } ): Promise< void > {
		await this.frame.click( selectors.headerPublishButtonSelector );
		await this.frame.click( selectors.publishPaneButtonSelector );

		await this.frame.waitForSelector( selectors.publishPaneViewPostSelector );

		if ( visit ) {
			await this._visitPublishedEntryFromPublishPane();
		}
	}

	/**
	 * Visits the published entry from the post-publish sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _visitPublishedEntryFromPublishPane(): Promise< void > {
		await Promise.all( [
			this.frame.click( selectors.publishPaneViewPostSelector ),
			this.page.waitForNavigation(),
			this.page.waitForLoadState( 'networkidle' ),
		] );
	}
}
