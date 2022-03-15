import { Page, FrameLocator, ElementHandle } from 'playwright';

const editorPane = 'div.edit-post-visual-editor__content-area';
const selectors = {
	// Title
	title: '.editor-post-title__input',

	// Editor body
	emptyBlock: 'div.block-editor-default-block-appender', // When editor is in a 'resting' state, without a selected block.
	paragraphBlock: ( { empty }: { empty: boolean } ) =>
		`p[data-title="Paragraph"][data-empty="${ empty }"]`,
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
		const locator = this.frameLocator.locator( selectors.title );
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
		const locator = this.frameLocator.locator( selectors.title );
		await locator.fill( sanitizedTitle );
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
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * Note that this method of text entry does not explicitly use the
	 * ParagraphBlock construct. This is due to text entry being a high
	 * frequency use case.
	 *
	 * @param {string} text Text to be entered.
	 */
	async enterText( text: string ): Promise< void > {
		const splitText = text.split( '\n' );

		// Depending on what is focused in the editor, either one of the
		// following elements can be clicked to initiate text entry.
		const emptyBlockLocator = this.frameLocator.locator( selectors.emptyBlock );
		const emptyParagraphLocator = this.frameLocator.locator(
			selectors.paragraphBlock( { empty: true } )
		);

		if ( await emptyParagraphLocator.count() ) {
			await emptyParagraphLocator.click();
		} else {
			emptyBlockLocator.click();
		}

		for await ( const line of splitText ) {
			// Select the last Paragraph block which is empty.
			const locator = this.frameLocator
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
		const locator = this.frameLocator.locator( selectors.paragraphBlock( { empty: false } ) );
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

		return sanitizedText.join( '\n' );
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
	 * Returns the currently selected block's ElementHandle.
	 *
	 * @returns {Promise<ElementHandle>} ElementHandle of the selected block.
	 */
	async getSelectedBlockElementHandle( blockEditorSelector: string ): Promise< ElementHandle > {
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
