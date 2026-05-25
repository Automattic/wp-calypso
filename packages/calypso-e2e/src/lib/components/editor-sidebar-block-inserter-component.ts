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

		// Gutenberg 22.4.0+ auto-closes the sidebar after insertion in some cases,
		// so the button may never appear. Race the two terminal states.
		await Promise.any( [
			closeBlockInserterButtonLocator.waitFor(),
			sidebarLocator.waitFor( { state: 'detached' } ),
		] );

		// If the sidebar is already gone, nothing to do.
		if ( ( await sidebarLocator.count() ) === 0 ) {
			return;
		}

		// On mobile, the button can pass actionability checks but detach
		// mid-animation while the click is in-flight, hanging the click until
		// the action timeout. Bound each attempt with `timeout`, use
		// `noWaitAfter` to skip post-click navigation heuristics, and treat
		// sidebar detachment as success regardless of which attempt landed it.
		const maxAttempts = 3;
		for ( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
			try {
				await closeBlockInserterButtonLocator.click( {
					timeout: 5000,
					noWaitAfter: true,
				} );
			} catch {
				// The button may have detached between the isVisible-style check
				// above and the click. That is the success case here.
			}

			try {
				await sidebarLocator.waitFor( { state: 'detached', timeout: 5000 } );
				return;
			} catch {
				if ( attempt === maxAttempts ) {
					throw new Error(
						`Block inserter sidebar did not close after ${ maxAttempts } click attempts.`
					);
				}
			}
		}
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

		await Promise.all( [ locator.hover(), locator.focus() ] );
		await locator.click();

		return locator;
	}
}
