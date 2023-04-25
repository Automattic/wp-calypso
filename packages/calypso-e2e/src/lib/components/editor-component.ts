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
	async getParentFrame(): Promise< Page | Frame > {
		if ( this.parentFrame ) {
			return this.parentFrame;
		}

		const parentFrame = await Promise.race( [
			this.waitForParentFrame(),
			this.waitForParentWrapper(),
		] );

		if ( ! parentFrame ) {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		this.parentFrame = parentFrame;

		return parentFrame;
	}

	/** */
	async getCanvas(): Promise< Page | Frame > {
		if ( this.canvasFrame ) {
			return this.canvasFrame;
		}

		const canvasFrame = await Promise.race( [
			this.waitForCanvasFrame(),
			this.waitForCanvasWrapper(),
		] );

		if ( ! canvasFrame ) {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}

		this.canvasFrame = canvasFrame;

		return canvasFrame;
	}

	/** */
	private async waitForParentFrame() {
		await this.page
			.frameLocator( 'iframe[src*="calypsoify"]' )
			.locator( 'body' )
			.waitFor( { timeout: EDITOR_TIMEOUT } );
		const parentFrame = this.page.frame( { url: /calypsoify/ } );

		return parentFrame;
	}

	/** */
	private async waitForParentWrapper() {
		const editorBody = this.page.locator( 'body.block-editor-page' );
		await editorBody.waitFor( { timeout: EDITOR_TIMEOUT } );

		return this.page;
	}

	/** */
	private async waitForCanvasFrame() {
		await this.page.frameLocator( 'iframe[name="editor-canvas"]' ).locator( 'body' ).waitFor();
		const canvasFrame = this.page.frame( 'editor-canvas' );

		return canvasFrame;
	}

	/** */
	private async waitForCanvasWrapper() {
		const parentFrame = await this.getParentFrame();
		const canvasWrapper = parentFrame.locator( '.editor-styles-wrapper' );
		await canvasWrapper.waitFor();

		return parentFrame;
	}
}
