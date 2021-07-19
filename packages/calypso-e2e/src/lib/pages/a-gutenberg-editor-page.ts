import assert from 'assert';
import { Frame, Page } from 'playwright';

const selectors = {
	// iframe and editor
	editorFrame: '.calypsoify.is-iframe iframe.is-loaded',
	editorTitle: '.editor-post-title__input',
	editorBody: '.edit-post-visual-editor',

	// Editor body
	blockAppender: '.block-editor-default-block-appender',
	paragraphBlocks: 'p.block-editor-rich-text__editable',

	// Top bar
	editPostHeader: '.edit-post-header',

	// Publish panel (including post-publish)
	publishPanel: '.editor-post-publish-panel',
	viewPostButton: 'text=View Post',
};

/**
 * Represents an instance of the WPCOM's Gutenberg editor page.
 */
export class AGutenbergEditorPage {
	private page: Page;

	/**
	 * get iframe for editor
	 *
	 * @returns iframe for editor
	 */
	private async getEditorFrame(): Promise< Frame > {
		const elementHandle = await this.page.waitForSelector( selectors.editorFrame );
		return ( await elementHandle.contentFrame() ) as Frame;
	}

	/**
	 * Constructor
	 *
	 * @param page Playwright page instance
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Enters the text into the title block and verifies the result.
	 *
	 * @param {string} title Text to be used as the title.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterTitle( title: string ): Promise< void > {
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
		const frame = await this.getEditorFrame();
		await frame.click( selectors.editorTitle );
		await frame.fill( selectors.editorTitle, title );
	}

	/**
	 * Returns the text as entered in the title block, or an empty string if
	 * not found.
	 *
	 * @returns {Promise<string>} Text value of the title block.
	 */
	async getTitle(): Promise< string > {
		const frame = await this.getEditorFrame();
		await frame.waitForSelector( selectors.editorTitle );
		return ( await frame.$eval( selectors.editorTitle, ( el ) => el.textContent ) ) || '';
	}

	/**
	 * Enters text into the paragraph block(s) and verifies the result.
	 *
	 * @param {string} text Text to be entered into the paragraph blocks, separated by newline characters.
	 * @returns {Promise<void>} No return value.
	 * @throws {assert.AssertionError} If text entered and text read back do not match.
	 */
	async enterText( text: string ): Promise< void > {
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
		const frame = await this.getEditorFrame();
		const lines = text.split( '\n' );
		await frame.click( selectors.blockAppender );

		// Playwright does not break up newlines in Gutenberg. This causes issues when we expect
		// text to be broken into new lines/blocks. This presents an unexpected issue when entering
		// text such as 'First sentence\nSecond sentence', as it is all put in one line.
		// frame.type() will respect newlines like a human would, but it is slow.
		// This approach will run faster than using frame.type() while respecting the newline chars.
		await Promise.all(
			lines.map( async ( line, index ) => {
				await frame.fill( `${ selectors.paragraphBlocks }:nth-of-type(${ index + 1 })`, line );
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
		const frame = await this.getEditorFrame();
		// Each blocks have the same overall selector. This will obtain a list of
		// blocks that are paragraph type and return an array of ElementHandles.
		const paragraphBlocks = await frame.$$( selectors.paragraphBlocks );

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
	 * Publishes the post or page.
	 *
	 * @param {boolean} visit Whether to then visit the page.
	 * @returns {Promise<void} No return value.
	 */
	async publish( { visit = false }: { visit?: boolean } ): Promise< void > {
		const frame = await this.getEditorFrame();
		await frame.click( `${ selectors.editPostHeader } >> text=Publish` );
		await frame.click( `${ selectors.publishPanel } >> text=Publish` );

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
		const frame = await this.getEditorFrame();
		await Promise.all( [ this.page.waitForNavigation(), frame.click( selectors.viewPostButton ) ] );
		await this.page.waitForLoadState( 'networkidle' );
	}
}
