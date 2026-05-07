import { expect } from '@playwright/test';
import { Page, Locator } from 'playwright';
import envVariables from '../../env-variables';
import { EditorComponent } from './editor-component';

const sidebarParentSelector = '.block-editor-inserter__main-area';
const selectors = {
	closeBlockInserterButton: 'button[aria-label="Close Block Inserter"]',
	blockSearchInput: `${ sidebarParentSelector } input[type="search"]`,
	patternExactResultItem: ( name: string ) =>
		`${ sidebarParentSelector } div[aria-label="${ name }"]`,
	patternResultItem: ( name: string ) => `${ sidebarParentSelector } div[aria-label*="${ name }"]`,
};

/**
 * Represents the primary, sidebar block inserter in the editor.
 */
export class EditorSidebarBlockInserterComponent {
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
	 * Closes the Block Inserter from the panel.
	 *
	 * This operation is only available for Mobile viewports where the
	 * Block Inserter panel is treated as an overlay.
	 */
	async closeBlockInserter(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			return;
		}

		const editorParent = await this.editor.parent();
		const sidebarLocator = this.page.locator( sidebarParentSelector );
		const closeBlockInserterButtonLocator = editorParent.locator(
			selectors.closeBlockInserterButton
		);

		// The mobile inserter has three failure modes that all need handling:
		//   1. The sidebar auto-closes itself in some Gutenberg states (22.4.0+),
		//      so the close button may never appear.
		//   2. The sidebar can auto-detach between observation and the click
		//      landing, leaving the button non-actionable.
		//   3. On slow CI the click occasionally no-ops and the panel stays
		//      attached for the full action timeout.
		//
		// `expect.toPass` retries the whole click+assert pair, which covers
		// (3) (the load-bearing case that a single web-first assertion cannot
		// fix, since `click()` resolves on dispatch, not on resulting state).
		// The early count check skips the click entirely for (1); a click
		// failure in (2) is caught by toPass and the next iteration sees the
		// sidebar gone and exits.
		await expect( async () => {
			if ( ( await sidebarLocator.count() ) === 0 ) {
				return;
			}
			if ( await closeBlockInserterButtonLocator.isVisible() ) {
				await closeBlockInserterButtonLocator.click( { timeout: 5 * 1000 } );
			}
			await expect( sidebarLocator ).toHaveCount( 0 );
		} ).toPass( { timeout: 30 * 1000, intervals: [ 500, 1000, 2000 ] } );
	}

	/**
	 * Searches the Block Inserter for the provided string.
	 *
	 * @param {string} text Text to enter into the search input.
	 */
	async searchBlockInserter( text: string ): Promise< void > {
		const editorParent = await this.editor.parent();
		const locator = editorParent.locator( selectors.blockSearchInput );
		await locator.fill( text );
	}

	/**
	 * Selects the matching result from the block inserter.
	 *
	 * By default, this method considers only the Block-type results
	 * (including Resuable blocks).
	 * In order to select from Pattern-type results, set the `type`
	 * optional flag in the parameter to `'pattern'`.
	 *
	 * Where multiple matches exist (eg. due to partial matching), the first result will be chosen.
	 */
	async selectBlockInserterResult(
		name: string,
		{
			type = 'block',
			blockFallBackName = '',
			exactMatch = true,
		}: { type?: 'block' | 'pattern'; blockFallBackName?: string; exactMatch?: boolean } = {}
	): Promise< Locator > {
		const editorParent = await this.editor.parent();
		let locator;

		if ( type === 'pattern' ) {
			locator = editorParent
				.locator(
					exactMatch
						? selectors.patternExactResultItem( name )
						: selectors.patternResultItem( name )
				)
				.first();

			// The pattern dialog does not load in-order. Grab the label of the match we found, then re-do the locator as an exact match.
			if ( ! exactMatch ) {
				const actualName = await locator.getAttribute( 'aria-label' );
				locator = editorParent
					.locator( selectors.patternExactResultItem( String( actualName ) ) )
					.first();
			}
		} else {
			const optionName = blockFallBackName
				? new RegExp( `(${ name }|${ blockFallBackName })` )
				: name;
			locator = editorParent
				// The DOM structure that hold the block options changes a LOT dependent on whether there's a search.
				// This combined selector is not the slickest, but capture both cases.
				// There's not an easy way to use "getByRole" to capture two cases without a lot of promise racing.
				.locator( '.block-editor-inserter__block-list,.block-editor-block-types-list' )
				.getByRole( 'option', {
					name: optionName,
					exact: true,
				} )
				.first();
		}

		// Hover is best-effort: on mobile/CI it occasionally hangs after the
		// element resolves and the auto-wait reports the element visible and
		// stable, exhausting the action timeout for no useful reason. The
		// click below does not require a prior hover, so swallow timeouts.
		try {
			await locator.hover( { timeout: 2000 } );
		} catch {
			// Hover unavailable; proceed with focus + click.
		}
		await locator.focus();
		// Pattern insertion does not navigate but can emit events that Playwright
		// treats as "scheduled navigation" on slow CI, hanging the click auto-wait.
		await locator.click( type === 'pattern' ? { noWaitAfter: true } : undefined );

		return locator;
	}
}
