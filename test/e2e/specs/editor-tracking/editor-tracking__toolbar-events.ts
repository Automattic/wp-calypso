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
	HeaderBlock,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

// None of these toolbar actions are available in mobile.
skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )(
	DataHelper.createSuiteTitle( 'Editor tracking: Toolbar-related events' ),
	function () {
		const features = envToFeatureKey( envVariables );

		describe( 'wpcom_block_editor_list_view_toggle/select', function () {
			let page: Page;
			let editorPage: EditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				const accountName = getTestAccountByFeature( features );
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				editorPage = new EditorPage( page, { target: features.siteType } );
			} );

			it( 'Start a new post', async function () {
				await editorPage.visit( 'post' );
				await editorPage.waitUntilLoaded();
			} );

			it( 'Enter some text', async function () {
				await editorPage.enterText( 'The actual text does not matter for this test.' );
			} );

			it( 'Toggle open the list view', async function () {
				await editorPage.openListView();
			} );

			it( '"wpcom_block_editor_list_view_toggle" event fires with "is_open" set to true', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_list_view_toggle',
					{
						matchingProperties: {
							is_open: true,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Select paragphraph block in list view', async function () {
				await editorPage.clickFirstListViewEntryByType( 'Paragraph' );
			} );

			it( '"wpcom_block_editor_list_view_select" event fires with correct "block_name" property', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_list_view_select',
					{
						matchingProperties: {
							block_name: 'core/paragraph',
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the list view', async function () {
				await editorPage.closeListView();
			} );

			it( '"wpcom_block_editor_list_view_toggle" event fires again with "is_open" set to false', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_list_view_toggle',
					{
						matchingProperties: {
							is_open: false,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_block_editor_undo/redo_performed', function () {
			let page: Page;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let testAccount: TestAccount;

			beforeAll( async () => {
				page = await browser.newPage();

				const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Go to site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Add a Header block', async function () {
				await fullSiteEditorPage.addBlockFromSidebar(
					HeaderBlock.blockName,
					HeaderBlock.blockEditorSelector
				);
			} );

			it( 'Undo action', async function () {
				await fullSiteEditorPage.undo();
			} );

			it( '"wpcom_block_editor_undo_performed" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_undo_performed'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Redo action', async function () {
				await fullSiteEditorPage.redo();
			} );

			it( '"wpcom_block_editor_redo_performed" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_redo_performed'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );
	}
);
