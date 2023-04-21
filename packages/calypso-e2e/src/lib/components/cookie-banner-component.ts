import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

const selectors = {
	acceptCookie: '.a8c-cookie-banner__ok-button',
};

/**
 * Represents the cookie banner shown on pages when not logged in.
 */
export class CookieBannerComponent extends EditorWindow {
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page } page The underlying page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Accept and clear the cookie notice.
	 */
	async acceptCookie(): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( selectors.acceptCookie );

		// Whether the cookie banner appears is not deterministic.
		// If it is not present, exit early.
		if ( ( await locator.count() ) === 0 ) {
			return;
		}

		await locator.click();
	}
}
