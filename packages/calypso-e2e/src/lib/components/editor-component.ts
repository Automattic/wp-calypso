import { Page, Frame } from 'playwright';

const EDITOR_TIMEOUT = 60 * 1000;

/** */
export class EditorComponent {
	private page: Page;
	private parentFrame: Page | Frame | null;
	private canvasFrame: Page | Frame | null;

	/** */
	constructor( page: Page ) {
		this.page = page;
		this.parentFrame = null;
		this.canvasFrame = null;
	}

	/** */
	async frame(): Promise< Page | Frame > {
		if ( this.parentFrame ) {
			return this.parentFrame;
		}

		const parentFrame = await Promise.race( [
			this.waitForFramedEditor(),
			this.waitForUnframedEditor(),
		] );

		if ( ! parentFrame ) {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		this.parentFrame = parentFrame;

		return parentFrame;
	}

	/** */
	async canvas(): Promise< Page | Frame > {
		if ( this.canvasFrame ) {
			return this.canvasFrame;
		}

		const canvasFrame = await Promise.race( [
			this.waitForFramedCanvas(),
			this.waitForUnframedCanvas(),
		] );

		if ( ! canvasFrame ) {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}

		this.canvasFrame = canvasFrame;

		return canvasFrame;
	}

	/** */
	private async waitForFramedEditor() {
		await this.page
			.frameLocator( 'iframe[src*="calypsoify"]' )
			.locator( 'body' )
			.waitFor( { timeout: EDITOR_TIMEOUT } );
		const parentFrame = this.page.frame( { url: /calypsoify/ } );

		return parentFrame;
	}

	/** */
	private async waitForUnframedEditor() {
		const editorBody = this.page.locator( 'body.block-editor-page' );
		await editorBody.waitFor( { timeout: EDITOR_TIMEOUT } );

		return this.page;
	}

	/** */
	private async waitForFramedCanvas() {
		await this.page.frameLocator( 'iframe[name="editor-canvas"]' ).locator( 'body' ).waitFor();
		const canvasFrame = this.page.frame( 'editor-canvas' );

		return canvasFrame;
	}

	/** */
	private async waitForUnframedCanvas() {
		const parentFrame = await this.frame();
		const canvasWrapper = parentFrame.locator( '.editor-styles-wrapper' );
		await canvasWrapper.waitFor();

		return parentFrame;
	}
}
