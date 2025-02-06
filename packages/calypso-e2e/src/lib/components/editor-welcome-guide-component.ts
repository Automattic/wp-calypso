import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const selectors = {
	// Welcome guide
	welcomeGuideCloseButton: '.edit-post-welcome-guide button[aria-label="Close"]',
};

/**
 * Represents the welcome guide that shows in a popover when the editor loads.
 */
export class EditorWelcomeGuideComponent {
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
	 * close the welcome guide if needed.
	 */
	async closeWelcomeGuideIfNeeded(): Promise< void > {
		const editorParent = await this.editor.parent();
		if ( await this.page.isVisible( selectors.welcomeGuideCloseButton ) ) {
			const locator = editorParent.locator( selectors.welcomeGuideCloseButton );
			await locator.click();
		}
	}
}
