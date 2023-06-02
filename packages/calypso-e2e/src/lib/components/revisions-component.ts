import { Page } from 'playwright';

const selectors = {
	revisionNumber: ( index: number ) =>
		`li.editor-revisions-list__revision:nth-last-child(${ index })`,
	button: ( text: string ) => `div[aria-modal="true"] button:has-text("${ text }")`,

	// Diff viewer
	diffViewer: ( text: string ) => `div.editor-revisions__dialog :text("${ text }")`,
};

/**
 * Component representing the revisions modal within the Gutenberg editor.
 */
export class RevisionsComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given an 1-indexed number, selects the revision in *chronological order*.
	 *
	 * For example, with 3 revisions:
	 * 	- index: 1 will select the oldest revision.
	 * 	- index: 3 will select the newest revision.
	 *
	 * @param {number} index 1-indexed revision number to select.
	 */
	async selectRevision( index: number ): Promise< void > {
		await this.page.click( selectors.revisionNumber( index ) );
		await this.page.waitForSelector( `${ selectors.revisionNumber( index ) }.is-selected` );
	}

	/**
	 * Loads the currently selected revision
	 */
	async loadSelectedRevision(): Promise< void > {
		await this.page.click( selectors.button( 'Load' ) );
	}
}
