import { Locator, Page } from 'playwright';
import { envVariables } from '../..';
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
	name?: string;
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

		let locator: Locator;
		if ( identifier.name ) {
			// Accessible names don't need to have the selector built, but needs to be narrowed
			// to the toolbar.
			await editorParent
				.getByRole( 'toolbar', { name: 'Block tools' } )
				.getByRole( 'button', { name: identifier.name } )
				.click();
		} else {
			// Other identifers need to have the selector built.
			locator = editorParent.locator( selectors.button( identifier ) );
		}

		const handle = await locator.elementHandle();
		await handle?.waitForElementState( 'stable' );

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

	/**
	 * Clicks the parent block button on the toolbar. Note, this only applies to desktop, as this button
	 * is hidden under more options on mobile.
	 *
	 * @param {string} expectedParentBlockName The expected name of the parent block.
	 */
	async clickParentBlockButton( expectedParentBlockName: string ): Promise< void > {
		// On mobile, you select the parent block in a separate options menu item.
		// That interaction should be driven by the parent method in Editor pages.
		if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			const editorParent = await this.editor.parent();
			const locator = editorParent
				.locator( parentSelector )
				.getByRole( 'button', { name: `Select ${ expectedParentBlockName }` } );
			await locator.click();
			await locator.waitFor( { state: 'detached' } );
		} else {
			throw new Error( 'The separate parent block toolbar button is not available on mobile.' );
		}
	}
}
