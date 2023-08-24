import { Locator, Page } from 'playwright';
import { EditorComponent } from '../components';

const selectors = {
	internalFrame: '.components-sandbox',
};

/**
 * Represents the VideoPress block.
 */
export class VideoPressBlock {
	static blockName = 'VideoPress';
	static blockEditorSelector = `div[aria-label="Block: ${ VideoPressBlock.blockName }"]`;

	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of this block.
	 *
	 * @param {Page} page The underlying page object.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.editor = new EditorComponent( page );
	}

	/**
	 * Uplaods the target file.
	 *
	 * @param {string} path Path to the file on disk.
	 */
	async upload( path: string ) {
		const editorCanvas = await this.editor.canvas();
		const block = editorCanvas.getByRole( 'document', {
			name: `Block: ${ VideoPressBlock.blockName }`,
		} );

		await block.locator( 'input' ).setInputFiles( path );

		await block.getByText( 'Upload Complete!' ).waitFor( { timeout: 25 * 1000 } );
		await block.getByRole( 'button', { name: 'Done' } ).click();

		await block
			.frameLocator( '.components-sandbox' )
			.frameLocator( 'VideoPress Video Player' )
			.getByRole( 'button', { name: 'Play Video' } )
			.waitFor( { timeout: 30 * 1000 } );
	}

	/**
	 *
	 */
	async clickButton( action: string ) {
		const editorCanvas = await this.editor.canvas();
		const block = editorCanvas.getByRole( 'document', {
			name: `Block: ${ VideoPressBlock.blockName }`,
		} );

		const target = block
			.frameLocator( selectors.internalFrame )
			.getByRole( 'button', { name: action } );

		await target.hover();
		await target.waitFor();
		await target.click();
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ) {
		const videoPlayer = page
			.frameLocator( 'VideoPress Video Player' )
			.getByRole( 'region', { name: 'Video Player' } );

		const playButton = videoPlayer.getByRole( 'button', { name: 'Play Video' } );
		await playButton.hover();
		await playButton.click();

		const pauseButton = videoPlayer.getByRole( 'button', { name: 'Pause' } );
		await pauseButton.hover();
		await pauseButton.click();
	}
}
