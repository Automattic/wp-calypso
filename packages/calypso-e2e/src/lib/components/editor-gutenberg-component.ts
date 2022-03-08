import { Page, FrameLocator, ElementHandle } from 'playwright';

const editorPane = 'div.edit-post-visual-editor__content-area';
const selectors = {
	// Title
	title: '.editor-post-title__input',

	// Editor body
	initialBlockAppender: '.block-editor-default-block-appender', // When editor is initially loaded in blank state
	paragraphBlock: ( empty: boolean ) => `p[data-title="Paragraph"][data-empty="${ empty }"]`,
	blockWarning: '.block-editor-warning',

	// Block Search
	blockSearchInput: '.block-editor-inserter__search input[type="search"]',
	blockResultItem: ( name: string ) =>
		`.block-editor-block-types-list__list-item span:text("${ name }")`,
	patternResultItem: ( name: string ) => `div[aria-label="${ name }"]`,
};

/**
 * Represents an instance of the Gutenberg Block Editor as loaded on
 * WordPress.com.
 */
export class EditorGutenbergComponent {
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

	/* Title block */

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 */
	async enterTitle( title: string ): Promise< void > {
		const locator = this.frameLocator.locator( selectors.title );
		await locator.fill( title );
	}

	/**
	 * Returns the content of the Page/Post title.
	 *
	 * @returns {Promise<string>} String containing contents of the title.
	 */
	async getTitle(): Promise< string > {
		const locator = this.frameLocator.locator( selectors.title );
		return await locator.innerText();
	}

	/* Paragraph block shortcuts */

	/**
	 *
	 */
	async resetSelectedBlock(): Promise< void > {
		const locator = this.frameLocator.locator( selectors.title );
		await locator.click();
	}

	/**
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * Note that this method of text entry does not explicitly use the
	 * ParagraphBlock construct. This is due to text entry being a high
	 * frequency use case.
	 *
	 * @param {string} textArray Array of text to be entered. Each entry is
	 * treated as individual Paragraph blocks.
	 */
	async enterText( textArray: string[] ): Promise< void > {
		const initialBlockAppenderLocator = this.frameLocator.locator( selectors.initialBlockAppender );
		const emptyParagraphLocator = this.frameLocator.locator( selectors.paragraphBlock( true ) );
		if ( await emptyParagraphLocator.count() ) {
			await emptyParagraphLocator.click();
		} else {
			initialBlockAppenderLocator.click();
		}

		for await ( const line of textArray ) {
			const locator = this.frameLocator.locator( selectors.paragraphBlock( true ) ).last();
			await locator.fill( line );
			await this.page.keyboard.press( 'Enter' );
		}
	}

	/**
	 * Returns the text as entered in the paragraph blocks.
	 */
	async getText(): Promise< string[] > {
		const locator = this.frameLocator.locator( selectors.paragraphBlock( false ) );
		const enteredText = await locator.allInnerTexts();

		// Extract the textContent of each paragraph block into a list.
		// Note the special condition for an empty paragraph block, noted below.
		const sanitizedText = enteredText.filter( async function ( line ) {
			// Strip out U+FEFF character that can be present even if
			// a paragraph block is empty.
			const sanitized = line.replace( /\ufeff/g, '' );

			if ( ! sanitized ) {
				return;
			}

			return sanitized;
		} );

		return sanitizedText;
	}

	/* Block actions */

	/**
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const locator = this.frameLocator.locator( selectors.blockSearchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the maching result from the block inserter.
	 *
	 * By default, this method considers only the Block-type results
	 * (including Resuable blocks).
	 * In order to select from Pattern-type results, set the `type`
	 * optional flag in the parameter to `'pattern'`.
	 *
	 * Where mulltiple matches exist (eg. due to partial matching), the first result will be chosen.
	 */
	async selectBlockInserterResult(
		name: string,
		{ type = 'block' }: { type?: 'block' | 'pattern' } = {}
	): Promise< void > {
		let locator;

		if ( type === 'pattern' ) {
			locator = this.frameLocator.locator( selectors.patternResultItem( name ) );
		} else {
			locator = this.frameLocator.locator( selectors.blockResultItem( name ) );
		}
		await locator.first().click();
	}

	/**
	 *
	 */
	async getBlockElementHandle( blockEditorSelector: string ): Promise< ElementHandle > {
		const locator = this.frameLocator.locator(
			`${ editorPane } ${ blockEditorSelector }.is-selected`
		);
		await locator.waitFor();
		return ( await locator.elementHandle() ) as ElementHandle;
	}

	/**
	 * Remove the block from the editor.
	 *
	 * This method requires the handle to the block in question to be passed in as parameter.
	 *
	 * @param {ElementHandle} blockHandle ElementHandle of the block to be removed.
	 */
	async removeBlock( blockHandle: ElementHandle ): Promise< void > {
		await blockHandle.press( 'Backspace' );
	}

	/**
	 * Checks whether the editor has any block warnings/errors displaying.
	 *
	 * @returns {Promise<boolean>} True if there are block warnings/errors.
	 * False otherwise.
	 */
	async editorHasBlockWarning(): Promise< boolean > {
		const locator = this.frameLocator.locator( selectors.blockWarning );
		return !! ( await locator.count() );
	}
}
