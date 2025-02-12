import { Page, Locator } from 'playwright';

const EDITOR_TIMEOUT = 60 * 1000;

/**
 * Represents the Editor component.
 */
export class EditorComponent {
	private page: Page;
	private parentLocator: Locator | null;
	private canvasLocator: Locator | null;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.parentLocator = null;
		this.canvasLocator = null;
	}

	/**
	 * Returns the Editor parent locator. It will automatically resolve to the
	 * proper locator, regardless if the Editor is Gutenframed or not.
	 */
	async parent(): Promise< Locator > {
		if ( this.parentLocator ) {
			return this.parentLocator;
		}

		try {
			this.parentLocator = await Promise.any( [
				this.waitForFramedEditor(),
				this.waitForUnframedEditor(),
			] );
		} catch ( _error ) {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		return this.parentLocator;
	}

	/**
	 * Returns the Editor canvas locator. It will automatically resolve to the
	 * proper locator, regardless if the canvas is iframed or not.
	 */
	async canvas(): Promise< Locator > {
		if ( this.canvasLocator ) {
			return this.canvasLocator;
		}

		try {
			this.canvasLocator = await Promise.any( [
				this.waitForFramedCanvas(),
				this.waitForUnframedCanvas(),
			] );
		} catch ( _error ) {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}

		return this.canvasLocator;
	}

	/**
	 * If the Editor is gutenframed, it will resolve with the parent element
	 * locator inside the Gutenframe once it's ready. Otherwise, it will time
	 * out.
	 */
	private async waitForFramedEditor() {
		const parentLocator = this.page
			.frameLocator( 'iframe[src*="calypsoify"]' )
			.locator( 'body.block-editor-page' );

		await parentLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return parentLocator;
	}

	/**
	 * If the Editor is NOT gutenframed, it will resolve with the parent element
	 * locator inside the main frame. Otherwise, it will time out.
	 */
	private async waitForUnframedEditor() {
		const parentLocator = this.page.locator( 'body.block-editor-page' );

		await parentLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return parentLocator;
	}

	/**
	 * If the Editor canvas is iframed, it will resolve with the parent element
	 * locator inside that iframe once it's ready. Otherwise, it will time out.
	 */
	private async waitForFramedCanvas() {
		const parentLocator = await this.parent();
		const canvasLocator = parentLocator
			.locator( '.editor-visual-editor' )
			.first()
			.frameLocator( 'iframe' )
			.locator( '.editor-styles-wrapper' );

		await canvasLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return canvasLocator;
	}

	/**
	 * If the Editor canvas is NOT iframed, it will resolve with the canvas
	 * element locator inside the current Editor parent once it's ready.
	 * Otherwise, it will time out.
	 */
	private async waitForUnframedCanvas() {
		const parentLocator = await this.parent();
		const canvasWrapper = parentLocator.locator( '.editor-styles-wrapper' );
		await canvasWrapper.waitFor();

		return parentLocator;
	}
}
