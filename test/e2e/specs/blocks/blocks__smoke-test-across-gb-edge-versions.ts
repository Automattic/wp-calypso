/**
 * @group gutenberg
 *
 * This spec is meant to be a lightweight test of popular/relevant blocks across
 * Gutenberg versions. This will run in a site stickered with `gutenberg-edge` and
 * will load a specific post with pre-configured blocks in it. It will then verify
 * that none of these blocks are error'ing or invalidating in the editor.
 *
 * This spec is not meant to replace specific block sepcs. First of all, specific
 * block specs should ideally be added upstream, and not here in Calypso, unless
 * the block is developed as part of the Calypso monorepo. This test is also not
 * meant to test specific block behavior, but instead to verify if they continue
 * working across GB versions, during the GB upgrade process in WPCOM.
 *
 * To avoid any confusion, the tests here will only run if the GUTENBERG_EDGE env
 * var is set.
 */
import { DataHelper, GutenbergEditorPage, TestAccount } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

const accountName = 'gutenbergUpgradeUser';
const postURL = 'https://wordpress.com/post/e2egbupgradeheveredge.wordpress.com/42805';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Gutenberg edge upgrade: test most popular blocks:' ),
	() => {
		let page: Page;
		let gutenbergEditorPage: GutenbergEditorPage;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			await page.goto( postURL );
			gutenbergEditorPage = new GutenbergEditorPage( page );
		} );

		// Both block invalidation and crash messages are wrapped by the same `Warning`
		// component in Gutenberg. If we find at least one warning, then we fail the test.
		it( 'will not have any block warnings', async () => {
			await gutenbergEditorPage.waitUntilLoaded();
			expect( await gutenbergEditorPage.editorHasBlockWarnings() ).toBe( false );
		} );
	}
);
