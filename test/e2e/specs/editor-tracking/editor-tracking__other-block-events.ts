/**
 * @group editor-tracking
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	TestAccount,
	EditorTracksEventManager,
	FullSiteEditorPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Editor tracking: Other block-related events' ),
	function () {
		const features = envToFeatureKey( envVariables );

		describe( '"wpcom_block_moved_*"', function () {
			const accountName = getTestAccountByFeature( features );
			let page: Page;
			let editorPage: EditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				editorPage = new EditorPage( page, { target: features.siteType } );
			} );

			it( 'Start a new post', async function () {
				await editorPage.visit( 'post' );
				await editorPage.waitUntilLoaded();
				// We'll be exiting without saving.
				editorPage.allowLeavingWithoutSaving();
			} );

			it( 'Add two blocks', async function () {
				await editorPage.addBlockFromSidebar( 'Heading', '[aria-label="Block: Heading"]' );
				await editorPage.addBlockFromSidebar( 'Markdown', '[aria-label="Block: Markdown"]' );
			} );

			it( 'Move the bottom block up', async function () {
				// The bottom block should be selected as it was the last added.
				await editorPage.moveBlockUp();
			} );

			it( '"wpcom_block_moved_up" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_moved_up' );
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Move the same block back down', async function () {
				// The same block is still selected.
				await editorPage.moveBlockDown();
			} );

			it( '"wpcom_block_moved_down" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_moved_down'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( '"wpcom_block_deleted"', function () {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;

			let page: Page;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Go to the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Add a Pullquote block', async function () {
				await fullSiteEditorPage.addBlockFromSidebar(
					'Pullquote',
					'[aria-label="Block: Pullquote"]'
				);
			} );

			it( 'Delete the Pullquote block from the block toolbar', async function () {
				// The Pullquote block should still be focused
				await fullSiteEditorPage.clickBlockToolbarOption( 'Remove Pullquote' );
			} );

			it( '"wpcom_block_deleted" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_deleted' );
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );
	}
);
