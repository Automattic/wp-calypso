import { Page, ElementHandle, Locator } from 'playwright';

const editorPane = 'div.edit-post-visual-editor__content-area';
const selectors = {
	// Title
	title: '.editor-post-title__input',

	// Editor body
	emptyBlock: 'div.block-editor-default-block-appender', // When editor is in a 'resting' state, without a selected block.
	paragraphBlock: ( { empty }: { empty: boolean } ) =>
		`p[data-title="Paragraph"][data-empty="${ empty }"]`,
	blockWarning: '.block-editor-warning',
};

/**
 * Represents an instance of the Gutenberg Block Editor as loaded on
 * WordPress.com. Supports both Atomic(non-framed) and Simple (framed)
 * editors.
 */
export class EditorGutenbergComponent {
	private page: Page;
	private editor: Locator;
	private editorCanvas: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator, editorCanvas: Locator ) {
		this.page = page;
		this.editor = editor;
		this.editorCanvas = editorCanvas;
	}

	/**
	 * Resets the selected block.
	 *
	 * The Gutenberg block-based editor 'remembers' what block was last
	 * selected. This behavior impacts the block options that are shown
	 * in the block inserter.
	 *
	 * For instance, if a Contact Form block is currently selected, the
	 * block inserter will display a filtered set of blocks that are
	 * permitted to be inserted within the parent Contact Form block.
	 */
	async resetSelectedBlock(): Promise< void > {
		const locator = this.editorCanvas.locator( selectors.title );
		await locator.click();
	}

	/* Title block */

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 */
	async enterTitle( title: string ): Promise< void > {
		const sanitizedTitle = title.trim();
		const locator = this.editorCanvas.locator( selectors.title );
		await locator.fill( sanitizedTitle, { timeout: 20 * 1000 } );
	}

	/**
	 * Returns the content of the Page/Post title.
	 *
	 * @returns {Promise<string>} String containing contents of the title.
	 */
	async getTitle(): Promise< string > {
		const locator = this.editorCanvas.locator( selectors.title );
		return await locator.innerText();
	}

	/* Paragraph block shortcuts */

	/**
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * Note that this method of text entry does not explicitly use the
	 * ParagraphBlock construct. This is due to text entry being a high
	 * frequency use case.
	 *
	 * @param {string} text Text to be entered.
	 */
	async enterText( text: string ): Promise< void > {
		const lines = text.split( '\n' );
		// Depending on what is focused in the editor, either one of the
		// following elements can be clicked to initiate text entry.
		const emptyBlockLocator = this.editorCanvas.locator( selectors.emptyBlock );
		const emptyParagraphLocator = this.editorCanvas.locator(
			selectors.paragraphBlock( { empty: true } )
		);

		if ( await emptyParagraphLocator.count() ) {
			await emptyParagraphLocator.click();
		} else {
			await emptyBlockLocator.click();
		}

		for ( const line of lines ) {
			// Select the last Paragraph block which is empty.
			const locator = this.editorCanvas
				.locator( selectors.paragraphBlock( { empty: true } ) )
				.last();

			await locator.fill( line );
			await this.page.keyboard.press( 'Enter' );
		}
	}

	/**
	 * Returns the text as entered in the paragraph blocks.
	 *
	 * @returns {Promise<string>} Text for all paragraph blocks, joined with a newline.
	 */
	async getText(): Promise< string > {
		// Locate all non-empty Paragraph blocks.
		const locator = this.editorCanvas.locator( selectors.paragraphBlock( { empty: false } ) );
		const enteredText = await locator.allInnerTexts();

		// Extract the textContent of each paragraph block into a list.
		// Note the special condition for an empty paragraph block, noted below.
		const sanitizedText = enteredText.filter( async function ( line: string ) {
			// Strip out U+FEFF character that can be present even if
			// a paragraph block is empty.
			const sanitized = line.replace( /\ufeff/g, '' );

			if ( ! sanitized ) {
				return;
			}

			return sanitized;
		} );

		return sanitizedText.join( '\n' );
	}

	/* Block actions */

	/**
	 * Returns the currently selected block's ElementHandle.
	 *
	 * @returns {Promise<ElementHandle>} ElementHandle of the selected block.
	 */
	async getSelectedBlockElementHandle( blockEditorSelector: string ): Promise< ElementHandle > {
		// Note the :is() selector. This is to support both the block API v1 and V2.
		const locator = this.editorCanvas.locator(
			`:is(${ editorPane } ${ blockEditorSelector }.is-selected, ${ editorPane } ${ blockEditorSelector }.has-child-selected)`
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
		const locator = this.editorCanvas.locator( selectors.blockWarning );
		return !! ( await locator.count() );
	}
}
