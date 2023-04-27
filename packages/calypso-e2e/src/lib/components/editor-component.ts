import { Page, Frame } from 'playwright';

const EDITOR_TIMEOUT = 60 * 1000;

/**
 * Represents the Editor component.
 */
export class EditorComponent {
	private page: Page;
	private editorFrame: Page | Frame | null;
	private canvasFrame: Page | Frame | null;

	/** */
	constructor( page: Page ) {
		this.page = page;
		this.editorFrame = null;
		this.canvasFrame = null;
	}

	/**
	 * Returns the parent Editor element. If the Editor is Gutenframed it will
	 * return the frame object. Otherwise it will return the current page object.
	 */
	async frame(): Promise< Page | Frame > {
		if ( this.editorFrame ) {
			return this.editorFrame;
		}

		try {
			this.editorFrame = await Promise.race( [
				this.waitForFramedEditor(),
				this.waitForUnframedEditor(),
			] );
		} catch ( _error ) {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		if ( ! this.editorFrame ) {
			throw new Error( 'Editor frame not found' );
		}

		return this.editorFrame;
	}

	/**
	 * Return the Editor canvas parent element. If the canvas is iframed it will
	 * return the frame object. Otherwise, it will return what's currently
	 * returned from the frame() method.
	 */
	async canvas(): Promise< Page | Frame > {
		if ( this.canvasFrame ) {
			return this.canvasFrame;
		}

		try {
			this.canvasFrame = await Promise.race( [
				this.waitForFramedCanvas(),
				this.waitForUnframedCanvas(),
			] );
		} catch ( _error ) {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}

		if ( ! this.canvasFrame ) {
			throw new Error( 'Editor canvas frame not found' );
		}

		return this.canvasFrame;
	}

	/** */
	private async waitForFramedEditor() {
		await this.page
			.frameLocator( 'iframe[src*="calypsoify"]' )
			.locator( 'body.block-editor-page' )
			.waitFor( { timeout: EDITOR_TIMEOUT } );
		const editorFrame = this.page.frame( { url: /calypsoify/ } );

		return editorFrame;
	}

	/** */
	private async waitForUnframedEditor() {
		const editorBody = this.page.locator( 'body.block-editor-page' );
		await editorBody.waitFor( { timeout: EDITOR_TIMEOUT } );

		return this.page;
	}

	/** */
	private async waitForFramedCanvas() {
		const canvasBody = this.page.frameLocator( 'iframe[name="editor-canvas"]' ).locator( 'body' );
		await canvasBody.waitFor( { timeout: EDITOR_TIMEOUT } );
		const canvasFrame = this.page.frame( 'editor-canvas' );

		return canvasFrame;
	}

	/** */
	private async waitForUnframedCanvas() {
		const editorFrame = await this.frame();
		const canvasWrapper = editorFrame.locator( '.editor-styles-wrapper' );
		await canvasWrapper.waitFor();

		return editorFrame;
	}
}
