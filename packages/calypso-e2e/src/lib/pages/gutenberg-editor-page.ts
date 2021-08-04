import assert from 'assert';
import { Page, Frame, ElementHandle } from 'playwright';

const selectors = {
	// iframe and editor
	editorFrame: '.calypsoify.is-iframe iframe.is-loaded',
	editorTitle: '.editor-post-title__input',
	editorBody: '.edit-post-visual-editor',

	// Block inserter
	blockInserterToggle: 'button.edit-post-header-toolbar__inserter-toggle',
	blockInserterPanel: '.block-editor-inserter__content',
	blockSearch: '[placeholder="Search"]',
	blockInserterResultItem: '.block-editor-block-types-list__list-item',

	// Within the editor body.
	blockAppender: '.block-editor-default-block-appender',
	paragraphBlocks: 'p.block-editor-rich-text__editable',

	// Top bar selectors.
	editPostHeader: '.edit-post-header',
	publishPanelToggle: '.editor-post-publish-panel__toggle',
	settingsToggle: '[aria-label="Settings"]',

	// Settings sidebar.
	settingsPanel: '.interface-complementary-area',

	// Publish panel (including post-publish)
	publishPanel: '.editor-post-publish-panel',
	viewButton: '.editor-post-publish-panel a:has-text("View")',
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class GutenbergEditorPage {
	private page: Page;
	private frame!: Frame;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Initialization steps.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitUntilLoaded(): Promise< void > {
		const elementHandle = await this.page.waitForSelector( selectors.editorFrame );
		this.frame = ( await elementHandle.contentFrame() ) as Frame;
		await this.page.waitForLoadState( 'networkidle' );
		await this.frame.waitForSelector( selectors.editorBody );
	}

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterTitle( title: string ): Promise< void > {
		await this.waitUntilLoaded();

		const sanitizedTitle = title.trim();
		await this.setTitle( sanitizedTitle );
		const readBack = await this.getTitle();
		assert.strictEqual( readBack, sanitizedTitle );
	}

	/**
	 * Fills the title block with text.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 */
	async setTitle( title: string ): Promise< void > {
		await this.frame.click( selectors.editorTitle );
		await this.frame.fill( selectors.editorTitle, title );
	}

	/**
	 * Returns the text as entered in the title block, or an empty string if
	 * not found.
	 *
	 * @returns {Promise<string>} Text value of the title block.
	 */
	async getTitle(): Promise< string > {
		await this.frame.waitForSelector( selectors.editorTitle );
		return ( await this.frame.$eval( selectors.editorTitle, ( el ) => el.textContent ) ) || '';
	}

	/**
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * @param {string} text Text to be entered into the paragraph blocks, separated by newline characters.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterText( text: string ): Promise< void > {
		await this.waitUntilLoaded();

		await this.setText( text );
		const readBack = await this.getText();
		assert.strictEqual( readBack, text );
	}

	/**
	 * Enters text into the body, splitting newlines into new pragraph blocks as necessary.
	 *
	 * @param {string} text Text to be entered into the body.
	 * @returns {Promise<void>} No return value.
	 */
	async setText( text: string ): Promise< void > {
		const lines = text.split( '\n' );
		await this.frame.click( selectors.blockAppender );

		// Playwright does not break up newlines in Gutenberg. This causes issues when we expect
		// text to be broken into new lines/blocks. This presents an unexpected issue when entering
		// text such as 'First sentence\nSecond sentence', as it is all put in one line.
		// frame.type() will respect newlines like a human would, but it is slow.
		// This approach will run faster than using frame.type() while respecting the newline chars.
		await Promise.all(
			lines.map( async ( line, index ) => {
				await this.frame.fill( `${ selectors.paragraphBlocks }:nth-of-type(${ index + 1 })`, line );
				await this.page.keyboard.press( 'Enter' );
			} )
		);
	}

	/**
	 * Returns the text as entered in the paragraph blocks.
	 *
	 * @returns {string} Visible text in the paragraph blocks, concatenated into one string.
	 */
	async getText(): Promise< string > {
		// Each blocks have the same overall selector. This will obtain a list of
		// blocks that are paragraph type and return an array of ElementHandles.
		const paragraphBlocks = await this.frame.$$( selectors.paragraphBlocks );

		// Extract the textContent of each paragraph block into a list.
		// Note the special condition for an empty paragraph block, noted below.
		const lines = await Promise.all(
			paragraphBlocks.map( async function ( block ) {
				// This U+FEFF character is present in the textContent of an otherwise
				// empty paragraph block and will evaluate to truthy.
				const text = String( await block.textContent() ).replace( /\ufeff/g, '' );

				if ( ! text ) {
					return;
				}

				return text;
			} )
		);

		// Strip out falsey values.
		return lines.filter( Boolean ).join( '\n' );
	}

	/**
	 * Given a name, adds the Gutenberg block matching the name.
	 *
	 * The name is expected to be formatted in the same manner as it
	 * appears on the label when visible in the block inserter panel.
	 *
	 * Example:
	 * 		- Click to Tweet
	 * 		- Pay with Paypal
	 * 		- SyntaxHighlighter Code
	 *
	 * @param {string} blockName Name of the block to be inserted.
	 */
	async addBlock( blockName: string ): Promise< ElementHandle > {
		await this.waitUntilLoaded();

		// Click on the editor title. This has the effect of dismissing the block inserter
		// if open, and restores focus back to the editor root container, allowing insertion
		// of blocks.
		await this.frame.click( selectors.editorTitle );
		await this.openBlockInserter();
		await this.frame.fill( selectors.blockSearch, blockName );
		await this.frame.click( `${ selectors.blockInserterResultItem }:has-text("${ blockName }")` );
		// Confirm the block has been added to the editor body.
		return await this.frame.waitForSelector( `[aria-label="Block: ${ blockName }"]` );
	}

	/**
	 * Open the block inserter panel.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openBlockInserter(): Promise< void > {
		await this.waitUntilLoaded();

		await this.frame.click( selectors.blockInserterToggle );
		await this.frame.waitForSelector( selectors.blockInserterPanel );
	}

	/**
	 * Opens the settings sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async openSettings(): Promise< void > {
		await this.waitUntilLoaded();

		const isSidebarOpen = await this.frame.$eval( selectors.settingsToggle, ( element ) =>
			element.classList.contains( 'is-pressed' )
		);
		if ( ! isSidebarOpen ) {
			await this.frame.click( selectors.settingsToggle );
		}
		const settingsToggle = await this.frame.waitForSelector( selectors.settingsToggle );
		await this.frame.waitForFunction(
			( element ) => element.getAttribute( 'aria-pressed' ) === 'true',
			settingsToggle
		);
	}

	/**
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {Promise<void} No return value.
	 */
	async publish( { visit = false }: { visit?: boolean } = {} ): Promise< string > {
		await this.waitUntilLoaded();

		await this.frame.click( `${ selectors.editPostHeader } >> text=Publish` );
		await this.frame.click( `${ selectors.publishPanel } >> text=Publish` );
		const viewPublishedArticleButton = await this.frame.waitForSelector( selectors.viewButton );
		const publishedURL = ( await viewPublishedArticleButton.getAttribute( 'href' ) ) as string;

		if ( visit ) {
			await this._visitPublishedEntryFromPublishPane();
		}
		return publishedURL;
	}

	/**
	 * Visits the published entry from the post-publish sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async _visitPublishedEntryFromPublishPane(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.frame.click( selectors.viewButton ),
		] );
		await this.page.waitForLoadState( 'networkidle' );
	}
}
