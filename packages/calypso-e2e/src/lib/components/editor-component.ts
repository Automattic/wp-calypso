import { Page, Frame } from 'playwright';

const EDITOR_TIMEOUT = 60 * 1000;

/** */
export class EditorComponent {
	public page: Page;

	/** */
	constructor( page: Page ) {
		this.page = page;
	}

	/** */
	async getParentFrame(): Promise< Page | Frame > {
		const editorFrame = await Promise.race( [
			new Promise< undefined >( ( resolve ) => {
				setTimeout( resolve, EDITOR_TIMEOUT );
			} ),
			( async (): Promise< Page > => {
				const editorBody = this.page.locator( 'body.block-editor-page' );
				await editorBody.waitFor( { timeout: EDITOR_TIMEOUT } );

				return this.page;
			} )(),
			new Promise< Frame >( ( resolve ) => {
				const pollInterval = setInterval( () => {
					const gutenframe = this.page.frame( { url: /calypsoify/ } );
					if ( gutenframe ) {
						clearInterval( pollInterval );
						resolve( gutenframe );
					}
				}, 100 );
			} ),
		] );

		if ( ! editorFrame ) {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		return editorFrame;
	}

	/** */
	async getCanvas(): Promise< Page | Frame > {
		const editorFrame = await this.getParentFrame();
		const editorCanvas = await Promise.race( [
			new Promise< undefined >( ( resolve ) => {
				setTimeout( resolve, EDITOR_TIMEOUT );
			} ),
			( async () => {
				const canvasWrapper = editorFrame.locator( '.editor-styles-wrapper' );
				await canvasWrapper.waitFor( { timeout: EDITOR_TIMEOUT } );

				return editorFrame;
			} )(),
			new Promise< Frame >( ( resolve ) => {
				const pollInterval = setInterval( () => {
					const canvasFrame = this.page.frame( 'editor-canvas' );
					if ( canvasFrame ) {
						clearInterval( pollInterval );
						resolve( canvasFrame );
					}
				}, 100 );
			} ),
		] );

		if ( ! editorCanvas ) {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}

		return editorCanvas;
	}
}
