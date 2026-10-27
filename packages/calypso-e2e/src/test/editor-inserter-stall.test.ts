import { describe, expect, jest, test } from '@jest/globals';
import { EditorSidebarBlockInserterComponent } from '../lib/components/editor-sidebar-block-inserter-component';
import { EditorToolbarComponent } from '../lib/components/editor-toolbar-component';
import type { EditorComponent } from '../lib/components/editor-component';
import type { Locator, Page } from 'playwright';

// Mirrors `actionTimeout` in test/e2e/playwright.config.ts.
const ACTION_TIMEOUT = 10 * 1000;

// On contended CI agents the renderer stayed busy for ~10 s across an
// inserter click before recovering. A click only completes once the renderer
// acknowledges its input, so the budget must outlast that.
const OBSERVED_STALL = 12 * 1000;

type ClickOptions = { timeout?: number; noWaitAfter?: boolean };

/**
 * Builds a Locator stand-in whose every query resolves to itself.
 *
 * Unit tests run without browsers (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD), so the
 * click budget is asserted on the options the components pass to Playwright.
 */
function fakeEditor( attributes: Record< string, string > = {} ) {
	const click = jest.fn( async ( options?: ClickOptions ) => options );
	const locator = {
		locator: () => locator,
		getByRole: () => locator,
		first: () => locator,
		click,
		count: async () => 1,
		getAttribute: async ( name: string ) => attributes[ name ] ?? null,
		evaluate: async () => undefined,
	} as unknown as Locator;
	const editor = { parent: async () => locator } as unknown as EditorComponent;

	return { click, editor, page: {} as Page };
}

/**
 * Returns the timeout the single recorded click ran with, or the default.
 */
function clickTimeout( click: jest.Mock< ( options?: ClickOptions ) => unknown > ) {
	expect( click ).toHaveBeenCalledTimes( 1 );
	return click.mock.calls[ 0 ][ 0 ]?.timeout ?? ACTION_TIMEOUT;
}

describe( 'Block inserter clicks outlast a stalled renderer', () => {
	test( 'selecting a block result', async () => {
		const { click, editor, page } = fakeEditor();

		await new EditorSidebarBlockInserterComponent( page, editor ).selectBlockInserterResult(
			'Subscribe'
		);

		expect( clickTimeout( click ) ).toBeGreaterThan( OBSERVED_STALL );
		expect( click.mock.calls[ 0 ][ 0 ]?.noWaitAfter ).toBeFalsy();
	} );

	test( 'selecting a pattern result keeps noWaitAfter', async () => {
		const { click, editor, page } = fakeEditor();

		await new EditorSidebarBlockInserterComponent( page, editor ).selectBlockInserterResult(
			'Header',
			{ type: 'pattern' }
		);

		expect( clickTimeout( click ) ).toBeGreaterThan( OBSERVED_STALL );
		expect( click.mock.calls[ 0 ][ 0 ]?.noWaitAfter ).toBe( true );
	} );

	test( 'opening the inserter', async () => {
		const { click, editor, page } = fakeEditor( { 'aria-pressed': 'false' } );

		await new EditorToolbarComponent( page, editor ).openBlockInserter();

		expect( clickTimeout( click ) ).toBeGreaterThan( OBSERVED_STALL );
	} );

	test( 'closing the inserter', async () => {
		const { click, editor, page } = fakeEditor( { 'aria-pressed': 'true' } );

		await new EditorToolbarComponent( page, editor ).closeBlockInserter();

		expect( clickTimeout( click ) ).toBeGreaterThan( OBSERVED_STALL );
	} );
} );
