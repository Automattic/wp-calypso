import { Page } from 'playwright';

const selectors = {
	editor: '#widgets-editor',

	// Welcome Guide
	welcomeModalDismissButton: 'div.components-modal__header > button', // Instead of aria-label, which changes depending on English UK/US.

	// Block Widget editor
	addBlockButton: 'button[aria-label="Add block"]',
	blockSearch: 'input[placeholder="Search"]',
};

// Server-rendered, so present once the response is parsed: 0.9-1.9s measured on the
// production configs. The margin absorbs the PR suite, where contention from a full
// parallel run stretches this spec five-fold.
const EDITOR_SHELL_TIMEOUT = 15 * 1000;

// The editor boots from deferred module scripts, which hold back both `load` and
// `domcontentloaded`. This wait is what absorbs a slow boot, so it needs a budget far
// beyond the default action timeout.
const EDITOR_READY_TIMEOUT = 60 * 1000;

/**
 * Component for the block-based Widget editor in Appearance > Widgets.
 */
export class BlockWidgetEditorComponent {
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
	 * Waits until the editor can insert the given legacy widget.
	 *
	 * Legacy widgets reach the inserter as block variations, registered only once the
	 * widget types have been fetched. The inserter indexes what is registered when the
	 * search term is entered and does not re-index, so searching too early returns
	 * "No results found" for as long as the panel stays open.
	 *
	 * @param {string} legacyWidget Name of the legacy widget variation, eg. 'authors'.
	 */
	async waitUntilLoaded( legacyWidget: string ): Promise< void > {
		await this.page.locator( selectors.editor ).waitFor( { timeout: EDITOR_SHELL_TIMEOUT } );

		await this.page.waitForFunction(
			( name ) =>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				!! ( window as any ).wp?.data
					?.select( 'core/blocks' )
					?.getBlockVariations( 'core/legacy-widget' )
					?.some( ( variation: { name: string } ) => variation.name === name ),
			legacyWidget,
			{ timeout: EDITOR_READY_TIMEOUT }
		);
	}

	/**
	 * Dismiss the Welcome modal if it appears.
	 *
	 * Call once `waitUntilLoaded` has resolved: the modal doesn't render before the editor.
	 */
	async dismissModals(): Promise< void > {
		const locator = this.page.locator( selectors.welcomeModalDismissButton );

		try {
			// The modal isn't guaranteed to appear.
			if ( ( await locator.count() ) === 0 ) {
				return;
			}
			await locator.click();
		} catch {
			//noop
		}
	}
}
