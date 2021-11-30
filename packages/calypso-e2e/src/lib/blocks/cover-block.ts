import { ImageBlock } from './image-block';

const coverStylesArray = [ 'Default', 'Bottom Wave', 'Top Wave' ] as const;
export type coverStyles = typeof coverStylesArray[ number ];

/**
 * Represents the Cover block.
 */
export class CoverBlock extends ImageBlock {
	static blockName = 'Cover';
	static blockEditorSelector = '[aria-label="Block: Cover"]';
	static coverStyles = coverStylesArray;

	/**
	 * Adds the title text over the block's image.
	 *
	 * @param text The title text.
	 */
	async addTitle( text: string ): Promise< void > {
		const titleHandle = await this.block.waitForSelector( 'p' );
		await titleHandle.type( text );
	}

	/**
	 * Sets given Cover style. Requires Setting panel to be open.
	 *
	 * @param {coverStyles} style The title of one of the Cover style buttons
	 */
	async setCoverStyle( style: coverStyles ): Promise< void > {
		const editorFrame = await this.block.ownerFrame();

		const styleButton = await editorFrame?.waitForSelector( `button[aria-label="${ style }"]` );
		await styleButton?.click();

		const blockId = await this.block.getAttribute( 'data-block' );
		const styleSelector = `.is-style-${ style.toLowerCase().replace( ' ', '-' ) }`;
		const blockSelector = `[data-block="${ blockId }"]`;

		await editorFrame?.waitForSelector( blockSelector + styleSelector );
	}
}
