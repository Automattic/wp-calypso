import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

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
 * Represents the toolbar menu that appears for a focused block.
 */
export class EditorBlockToolbarComponent {
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
	 * Click one of the primary (not buried under a drop down) buttons in the block toolbar.
	 *
	 * @param {BlockToolbarButtonIdentifier} identifier Ways to identify the button.
	 */
	async clickPrimaryButton( identifier: BlockToolbarButtonIdentifier ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.button( identifier ) );
		await locator.click();
	}

	/**
	 * Click on the options button (three dots).
	 */
	async clickOptionsButton(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.button( { ariaLabel: 'Options' } ) );
		await locator.click();
	}

	/**
	 * Click the up arrow button to move the current block up.
	 */
	async moveUp(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.button( { ariaLabel: 'Move up' } ) );
		await locator.click();
	}

	/**
	 * Click the down arrow button to move the current block down.
	 */
	async moveDown(): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.button( { ariaLabel: 'Move down' } ) );
		await locator.click();
	}
}
