import { Page } from 'playwright';
import { EditorWindow } from './editor-window';

const popoverParentSelector = '.popover-slot .components-popover';

const selectors = {
	menuButton: ( name: string ) => `${ popoverParentSelector } :text-is("${ name }")`,
};

/**
 * Represents the popover menu that can be launched from multiple different places.
 */
export class EditorPopoverMenuComponent extends EditorWindow {
	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		super( page );
	}

	/**
	 * Click menu button by name.
	 */
	async clickMenuButton( name: string ): Promise< void > {
		const editorFrame = await this.getEditorFrame();
		const locator = editorFrame.locator( selectors.menuButton( name ) );
		await locator.click();
	}
}
