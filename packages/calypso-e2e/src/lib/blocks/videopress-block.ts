import { Page } from 'playwright';
import { EditorComponent } from '../components';

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

		// The upload process is flaky in CI, so we retry a few times.
		let retries = 3;
		const setInputFilesWithRetry = async () => {
			await block.locator( 'input' ).setInputFiles( path );
			const info = block.getByText( /Upload Complete|Failed to upload your video/i );
			const infoText = await info.textContent( { timeout: 25 * 1000 } );

			if ( infoText?.match( /Failed to upload your video/i ) ) {
				await block.getByRole( 'button', { name: 'Try again' } ).click();
				if ( retries > 0 ) {
					retries--;
					await setInputFilesWithRetry();
				}
			}
		};

		await setInputFilesWithRetry();

		await block.getByRole( 'button', { name: 'Done' } ).click();

		await block.getByText( 'We are converting this video for optimal playback' ).waitFor( {
			timeout: 15 * 1000,
			state: 'hidden',
		} );
	}

	/**
	 * Clicks a matching button on the block.
	 *
	 * @param {string} text Text of the button to click.
	 */
	async clickButton( text: string ) {
		const editorCanvas = await this.editor.canvas();
		const block = editorCanvas.getByRole( 'document', {
			name: `Block: ${ VideoPressBlock.blockName }`,
		} );

		await block.frameLocator( '.components-sandbox' ).getByRole( 'button', { name: text } ).click();
	}

	/**
	 * Validates block on the page.
	 *
	 * @param {Page} page Page on which to verify the presence of the block.
	 */
	static async validatePublishedContent( page: Page ) {
		// According to p1692879768772799/1692861705.317909-slack-C02LT75D3, it is
		// not necessary to check whether the video can actually playback.
		await page.locator( '.wp-block-jetpack-videopress' ).waitFor();
	}
}
