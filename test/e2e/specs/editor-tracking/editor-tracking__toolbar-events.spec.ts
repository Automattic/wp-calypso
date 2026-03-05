import {
	DataHelper,
	EditorTracksEventManager,
	FullSiteEditorPage,
	HeaderBlock,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

// None of these toolbar actions are available in mobile.
test.describe.fixme(
	DataHelper.createSuiteTitle( 'Editor tracking: Toolbar-related events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		test( '"wpcom_block_editor_list_view_toggle" and "wpcom_block_editor_list_view_select" events fire', async ( {
			page,
			pageEditor,
		} ) => {
			test.skip(
				envVariables.VIEWPORT_NAME === 'mobile',
				'Toolbar actions not available on mobile'
			);

			const accountName = getTestAccountByFeature( features );
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
			} );

			await test.step( 'When I start a new post', async () => {
				await pageEditor.visit( 'post' );
				await pageEditor.waitUntilLoaded();
			} );

			await test.step( 'When I enter some text', async () => {
				await pageEditor.enterText( 'The actual text does not matter for this test.' );
			} );

			await test.step( 'When I toggle open the list view', async () => {
				await pageEditor.openListView();
			} );

			await test.step( 'Then "wpcom_block_editor_list_view_toggle" event fires with "is_open" === true', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_list_view_toggle',
					{
						matchingProperties: { is_open: true },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I select paragraph block in list view', async () => {
				await pageEditor.clickFirstListViewEntryByType( 'Paragraph' );
			} );

			await test.step( 'Then "wpcom_block_editor_list_view_select" event fires with correct "block_name"', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_list_view_select',
					{
						matchingProperties: { block_name: 'core/paragraph' },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I close the list view', async () => {
				await pageEditor.closeListView();
			} );

			await test.step( 'Then "wpcom_block_editor_list_view_toggle" event fires again with "is_open" === false', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_list_view_toggle',
					{
						matchingProperties: { is_open: false },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		test( '"wpcom_block_editor_undo_performed" and "wpcom_block_editor_redo_performed" events fire', async ( {
			page,
		} ) => {
			test.skip(
				envVariables.VIEWPORT_NAME === 'mobile',
				'Toolbar actions not available on mobile'
			);

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

			await test.step( 'When I go to site editor', async () => {
				await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I add a Header block', async () => {
				await fullSiteEditorPage.addBlockFromSidebar(
					HeaderBlock.blockName,
					HeaderBlock.blockEditorSelector
				);
			} );

			await test.step( 'When I undo action', async () => {
				await fullSiteEditorPage.undo();
			} );

			await test.step( 'Then "wpcom_block_editor_undo_performed" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_undo_performed'
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I redo action', async () => {
				await fullSiteEditorPage.redo();
			} );

			await test.step( 'Then "wpcom_block_editor_redo_performed" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_redo_performed'
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );
	}
);
