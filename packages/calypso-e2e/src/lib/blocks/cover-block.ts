import { Locator, Page } from 'playwright';
import { EditorWindow } from '../components';

const coverStylesArray = [ 'Default', 'Bottom Wave', 'Top Wave' ] as const;
export type coverStyles = typeof coverStylesArray[ number ];

/**
 * Represents the Cover block.
 */
export class CoverBlock extends EditorWindow {
	static blockName = 'Cover';
	static blockEditorSelector = '[aria-label="Block: Cover"]';
	static coverStyles = coverStylesArray;
	block: Locator;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page.
	 * @param {Locator} block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( page: Page, block: Locator ) {
		super( page );
		this.block = block;
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
		const editorFrame = await this.getEditorFrame();
		await editorFrame
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
		const editorFrame = await this.getEditorFrame();
		await editorFrame.locator( `[aria-label="${ name }"]` ).click();
	}

	/**
	 * Sets given Cover style. Requires Setting panel to be open.
	 *
	 * @param {coverStyles} style The title of one of the Cover style buttons
	 */
	async setCoverStyle( style: coverStyles ): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		await editorFrame.locator( `button[aria-label="${ style }"]` ).click();

		const blockId = await this.block.getAttribute( 'data-block' );
		const styleSelector = `.is-style-${ style.toLowerCase().replace( ' ', '-' ) }`;
		const blockSelector = `[data-block="${ blockId }"]`;

		await editorFrame.locator( blockSelector + styleSelector ).waitFor();
	}
}
