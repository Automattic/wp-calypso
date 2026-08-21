import {
	DataHelper,
	EditorTracksEventManager,
	FullSiteEditorPage,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe.fixme(
	DataHelper.createSuiteTitle( 'Editor tracking: Site editor document actions events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		// .fixme: the legacy "Show template details" dropdown the test clicks is
		// no longer present in current Gutenberg — the title button now opens
		// the command palette (`⌘K`). Confirmed this round: openDocumentActionsDropdown
		// times out on `button[aria-label="Show template details"]`, which no longer
		// exists. The product-side tracking
		// (apps/wpcom-block-editor/src/wpcom/features/tracking/wpcom-site-editor-document-actions-dropdown-click.js)
		// still binds click handlers to the removed selectors
		// (`.edit-site-document-actions__get-info`,
		// `.edit-site-template-details__template-areas`,
		// `.edit-site-template-details__revert`,
		// `.edit-site-template-details__show-all-button`), so these four events no
		// longer fire at all. Re-enabling requires the feature/tracking to be
		// re-pointed at the new UI product-side (out of scope here), not just a
		// test selector refresh. See TESTOPS-49.
		test( '"wpcom_site_editor_document_actions_dropdown_open" event fires', async ( { page } ) => {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page );
			} );

			await test.step( 'When I visit the site editor', async () => {
				await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I open the document actions dropdown', async () => {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			await test.step( 'Then "wpcom_site_editor_document_actions_dropdown_open" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_site_editor_document_actions_dropdown_open'
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		test( '"wpcom_site_editor_document_actions_template_area_click" event fires for header', async ( {
			page,
		} ) => {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page );
			} );

			await test.step( 'When I visit the site editor', async () => {
				await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I open the document actions dropdown', async () => {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			await test.step( 'When I click the Header template area button in the document actions dropdown', async () => {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__template-areas-item span:text("Header")'
				);
			} );

			await test.step( 'Then "wpcom_site_editor_document_actions_template_area_click" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_site_editor_document_actions_template_area_click',
					{
						matchingProperties: {
							template_area: 'header',
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		test( '"wpcom_site_editor_document_actions_revert_click" event fires', async ( { page } ) => {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page );
			} );

			await test.step( 'When I visit the site editor', async () => {
				await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I customize the current template', async () => {
				await fullSiteEditorPage.addBlockFromSidebar(
					'Paragraph',
					'p[aria-label="Empty block; start writing or type forward slash to choose a block"]'
				);
			} );

			await test.step( 'When I save the editor', async () => {
				await fullSiteEditorPage.save();
			} );

			await test.step( 'When I open the document actions dropdown', async () => {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			await test.step( 'When I click the template area clear customizations button', async () => {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__revert'
				);
			} );

			await test.step( 'Then "wpcom_site_editor_document_actions_revert_click" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_site_editor_document_actions_revert_click'
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		test( '"wpcom_site_editor_document_actions_show_all_click" event fires', async ( { page } ) => {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page );
			} );

			await test.step( 'When I visit the site editor', async () => {
				await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I open the document actions dropdown', async () => {
				await fullSiteEditorPage.openDocumentActionsDropdown();
			} );

			await test.step( 'When I click the template area browse all button', async () => {
				await fullSiteEditorPage.clickDocumentActionsDropdownItem(
					'.edit-site-template-details__show-all-button'
				);
			} );

			await test.step( 'Then "wpcom_site_editor_document_actions_show_all_click" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_site_editor_document_actions_show_all_click'
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );
	}
);
