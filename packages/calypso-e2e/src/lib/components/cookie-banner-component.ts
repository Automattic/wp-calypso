import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const selectors = {
	acceptCookie: '.a8c-cookie-banner__ok-button, .a8c-cookie-banner__accept-all-button',
};

/**
 * Represents the cookie banner shown on pages when not logged in.
 */
export class CookieBannerComponent {
	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Accept and clear the cookie notice.
	 */
	async acceptCookie(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.acceptCookie );

		// Whether the cookie banner appears is not deterministic.
		// If it is not present, exit early.
		try {
			await locator.waitFor( { timeout: 100 } );
		} catch ( e ) {
			// Probably doesn't exist. That's ok.
		}
		if ( ( await locator.count() ) === 0 ) {
			return;
		}

		if ( await locator.isVisible() ) {
			await locator.click();
		}
	}
}
