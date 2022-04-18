import { Page, Locator } from 'playwright';

const popoverParentSelector = '.popover-slot .components-popover';

const selectors = {
	menuButton: ( name: string ) => `${ popoverParentSelector } button:has-text("${ name }")`,
};

/**
 * Represents the popover menu that can be launched from multiple different places.
 */
export class EditorPopoverMenuComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Click menu button by name.
	 */
	async clickMenuButton( name: string ): Promise< void > {
		const locator = this.editor.locator( selectors.menuButton( name ) );
		await locator.click();
	}
}
