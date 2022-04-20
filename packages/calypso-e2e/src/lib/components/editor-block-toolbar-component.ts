import { Locator, Page } from 'playwright';

const parentSelector = '[aria-label="Block tools"]';

const selectors = {
	button: ( identifier: BlockToolbarButtonIdentifier ) => {
		if ( ! ( identifier.ariaLabel || identifier.text ) ) {
			throw new Error( 'You must provide at least one way to identify the menu button.' );
		}

		let selector = `${ parentSelector } button`;
		if ( identifier.ariaLabel ) {
			selector = `${ selector }[aria-label="${ identifier.ariaLabel }"]`;
		}

		if ( identifier.text ) {
			selector = `${ selector }:has-text("${ identifier.text }")`;
		}
		return selector;
	},
};

export interface BlockToolbarButtonIdentifier {
	text?: string;
	ariaLabel?: string;
}

/**
 * Represents the popover toolbar menu that appears for a focused block.
 */
export class EditorBlockToolbarComponent {
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
	 * Click one of the primary (not buried under a drop down) buttons in the block toolbar.
	 *
	 * @param {BlockToolbarButtonIdentifier} identifier Ways to identify the button.
	 */
	async clickPrimaryButton( identifier: BlockToolbarButtonIdentifier ) {
		const locator = await this.editor.locator( selectors.button( identifier ) );
		await locator.click();
	}
}
