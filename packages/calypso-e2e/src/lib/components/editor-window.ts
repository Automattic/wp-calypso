import { Page, Frame } from 'playwright';

/** */
export class EditorWindow {
	public page: Page;

	/** */
	constructor( page: Page ) {
		this.page = page;
	}

	/** */
	async getEditorFrame(): Promise< Page | Frame > {
		const editorFrame = await Promise.race( [
			( async () => {
				const calypsoIframe = this.page.locator( 'iframe[src*="calypsoify"]' );
				await calypsoIframe.waitFor();

				return this.page.frame( { url: /calypsoify/ } );
			} )(),
			( async () => {
				const editorBody = this.page.locator( 'body.block-editor-page' );
				await editorBody.waitFor();

				return this.page;
			} )(),
		] );

		if ( ! editorFrame ) {
			throw new Error( 'Editor frame unavailable' );
		}

		return editorFrame;
	}

	/** */
	async getEditorCanvas(): Promise< Page | Frame > {
		const editorFrame = await this.getEditorFrame();
		const editorCanvas = await Promise.race( [
			( async () => {
				const canvasIframe = editorFrame.locator( 'iframe[name="editor-canvas"]' );
				await canvasIframe.waitFor();

				return this.page.frame( 'editor-canvas' );
			} )(),
			( async () => {
				const canvasWrapper = this.page.locator( '.editor-styles-wrapper' );
				await canvasWrapper.waitFor();

				return editorFrame;
			} )(),
		] );

		if ( ! editorCanvas ) {
			throw new Error( 'Editor canvas unavailable' );
		}

		return editorCanvas;
	}
}
