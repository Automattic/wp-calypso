/**
 * @group gutenberg
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	TestAccount,
	EditorTracksEventManager,
	skipDescribeIf,
	SiteEditorPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

// None of these toolbar actions are available in mobile.
skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )(
	DataHelper.createSuiteTitle( 'Editor tracking: Toolbar-related events' ),
	function () {
		const features = envToFeatureKey( envVariables );

		describe( 'wpcom_block_editor_list_view_toggle/select', function () {
			let page: Page;
			let editorPage: EditorPage;
			let eventManager: EditorTracksEventManager;
			beforeAll( async () => {
				page = await browser.newPage();

				const accountName = getTestAccountByFeature( features );
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				eventManager = new EditorTracksEventManager( page );
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
				const eventDidFire = await eventManager.didEventFire(
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
				const eventDidFire = await eventManager.didEventFire(
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
				const eventDidFire = await eventManager.didEventFire(
					'wpcom_block_editor_list_view_toggle',
					{
						matchingProperties: {
							is_open: false,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		describe( 'wpcom_block_editor_details_open', function () {
			let page: Page;
			let editorPage: EditorPage;
			let eventManager: EditorTracksEventManager;
			beforeAll( async () => {
				page = await browser.newPage();

				const accountName = getTestAccountByFeature( features );
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				eventManager = new EditorTracksEventManager( page );
				editorPage = new EditorPage( page, { target: features.siteType } );
			} );

			it( 'Start a new post', async function () {
				await editorPage.visit( 'post' );
				await editorPage.waitUntilLoaded();
			} );

			// Needed to enable the details button.
			it( 'Enter some text', async function () {
				await editorPage.enterText( 'The actual text does not matter for this test either.' );
			} );

			it( 'Click details button', async function () {
				await editorPage.openDetailsPopover();
			} );

			it( '"wpcom_block_editor_details_open" event fires', async function () {
				const eventDidFire = await eventManager.didEventFire( 'wpcom_block_editor_details_open' );
				expect( eventDidFire ).toBe( true );
			} );
		} );

		describe( 'wpcom_block_editor_undo/redo_performed', function () {
			let page: Page;
			let siteEditorPage: SiteEditorPage;
			let eventManager: EditorTracksEventManager;
			let testAccount: TestAccount;
			beforeAll( async () => {
				page = await browser.newPage();

				const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				eventManager = new EditorTracksEventManager( page );
				siteEditorPage = new SiteEditorPage( page );
			} );

			it( 'Go to site editor', async function () {
				await siteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await siteEditorPage.prepareForInteraction();
			} );

			it( 'Add a Header block', async function () {
				await siteEditorPage.addBlockFromSidebar( 'Header' );
			} );

			it( 'Undo action', async function () {
				await page.pause();
				await siteEditorPage.undo();
			} );

			it( 'redo action', async function () {
				await siteEditorPage.redo();
			} );

			it( '"wpcom_block_editor_details_open" event fires', async function () {
				console.log( await eventManager.getAllEvents() );
			} );
		} );
	}
);
