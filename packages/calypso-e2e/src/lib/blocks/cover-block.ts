import { Page, Locator } from 'playwright';
import { EditorComponent } from '../components';

const coverStylesArray = [ 'Default', 'Bottom Wave', 'Top Wave' ] as const;
export type coverStyles = ( typeof coverStylesArray )[ number ];

/**
 * Represents the Cover block.
 */
export class CoverBlock {
	static blockName = 'Cover';
	static blockEditorSelector = '[aria-label="Block: Cover"]';
	static coverStyles = coverStylesArray;
	private editor: EditorComponent;
	block: Locator;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 * @param {Locator} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( page: Page, block: Locator ) {
		this.block = block;
		this.editor = new EditorComponent( page );
	}

	/**
	 * Uploads an image file to the Cover block.
	 *
	 * @param {string} path Path to the file on disk.
	 */
	async upload( path: string ): Promise< void > {
		await this.block.locator( 'input[type="file"]' ).setInputFiles( path );
		await this.block.locator( 'img[src^="blob:"]' ).waitFor( {
			timeout: 20 * 1000,
			state: 'detached',
		} );

		// After uploading the image the focus is switched to the inner
		// paragraph block (Cover title), so we need to switch it back outside.
		const editorParent = await this.editor.parent();
		await editorParent
			.locator( CoverBlock.blockEditorSelector )
			.click( { position: { x: 1, y: 1 } } );
	}

	/**
	 * Adds the title text over the block's image.
	 *
	 * @param text The title text.
	 */
	async addTitle( text: string ): Promise< void > {
		await this.block.locator( 'p' ).fill( text );
	}

	/**
	 * Activates the tab for the Cover block.
	 *
	 * @param {'Settings'|'Styles'} name Supported tabs.
	 */
	async activateTab( name: 'Settings' | 'Styles' ) {
		const editorParent = await this.editor.parent();
		await editorParent.locator( `[aria-label="${ name }"]` ).click();
	}

	/**
	 * Sets given Cover style. Requires Setting panel to be open.
	 *
	 * @param {coverStyles} style The title of one of the Cover style buttons
	 */
	async setCoverStyle( style: coverStyles ): Promise< void > {
		const editorParent = await this.editor.parent();
		await editorParent.locator( `button[aria-label="${ style }"]` ).click();

		const blockId = await this.block.getAttribute( 'data-block' );
		const styleSelector = `.is-style-${ style.toLowerCase().replace( ' ', '-' ) }`;
		const blockSelector = `[data-block="${ blockId }"]`;

		await editorParent.locator( blockSelector + styleSelector ).waitFor();
	}
}
