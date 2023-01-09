/**
 * @group editor-tracking
 */

import {
	DataHelper,
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
	DataHelper.createSuiteTitle( 'Editor tracking: Site editor document actions events' ),
	function () {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

		describe( 'wpcom_site_editor_document_actions_dropdown_open', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Open the document actions dropdown', async function () {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			it( '"wpcom_site_editor_document_actions_dropdown_open" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_site_editor_document_actions_dropdown_open'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_site_editor_document_actions_template_area_click header', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Open the document actions dropdown', async function () {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			it( 'Click the Header template area button in the document actions dropdown', async function () {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__template-areas-item span:text("Header")'
				);
			} );

			it( '"wpcom_site_editor_document_actions_template_area_click" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_site_editor_document_actions_template_area_click',
					{
						matchingProperties: {
							template_area: 'header',
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_site_editor_document_actions_revert_click', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Customize the current template', async function () {
				await fullSiteEditorPage.addBlockFromSidebar(
					'Paragraph',
					'p[aria-label="Empty block; start writing or type forward slash to choose a block"]'
				);
			} );

			it( 'Save the editor', async function () {
				await fullSiteEditorPage.save();
			} );

			it( 'Open the document actions dropdown', async function () {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			it( 'Click the template area clear customizations button in the document actions dropdown', async function () {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__revert'
				);
			} );

			it( '"wpcom_site_editor_document_actions_revert_click" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_site_editor_document_actions_revert_click'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_site_editor_document_actions_show_all_click', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Open the document actions dropdown', async function () {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			it( 'Click the template area browse all button in the document actions dropdown', async function () {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__show-all-button'
				);
			} );

			it( '"wpcom_site_editor_document_actions_show_all_click" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_site_editor_document_actions_show_all_click'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );
	}
);
