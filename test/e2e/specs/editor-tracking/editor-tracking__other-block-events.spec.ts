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

test.describe(
	DataHelper.createSuiteTitle( 'Editor tracking: Other block-related events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		test( '"wpcom_block_moved_up" and "wpcom_block_moved_down" events fire', async ( {
			page,
			pageEditor,
		} ) => {
			const accountName = getTestAccountByFeature( features );
			const testAccount = new TestAccount( accountName );
			const siteSlug = testAccount.getSiteURL( { protocol: false } );
			const editorTracksEventManager = new EditorTracksEventManager( page );

			await test.step( 'Given I am authenticated', async () => {
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I start a new post', async () => {
				await pageEditor.visit( 'post', { siteSlug } );
				await pageEditor.waitUntilLoaded();
				pageEditor.allowLeavingWithoutSaving();
			} );

			await test.step( 'When I add two blocks', async () => {
				await pageEditor.addBlockFromSidebar( 'Heading', '[aria-label^="Block: Heading"]' );
				await pageEditor.addBlockFromSidebar( 'Markdown', '[aria-label="Block: Markdown"]' );
			} );

			await test.step( 'When I move the bottom block up', async () => {
				await pageEditor.moveBlockUp();
			} );

			await test.step( 'Then "wpcom_block_moved_up" event fires', async () => {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_moved_up' );
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I move the same block back down', async () => {
				await pageEditor.moveBlockDown();
			} );

			await test.step( 'Then "wpcom_block_moved_down" event fires', async () => {
				const eventDidFire =
					await editorTracksEventManager.didEventFire( 'wpcom_block_moved_down' );
				expect( eventDidFire ).toBe( true );
			} );
		} );

		test( '"wpcom_block_deleted" event fires', async ( { page } ) => {
			// The site editor navigation sidebar cannot be closed on mobile
			// (FullSiteEditorPage.closeNavSidebar throws), so this flow is desktop-only.
			test.skip(
				envVariables.VIEWPORT_NAME === 'mobile',
				'Site editor navigation sidebar cannot be closed on mobile'
			);

			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			const testAccount = new TestAccount( accountName );
			const editorTracksEventManager = new EditorTracksEventManager( page );
			const fullSiteEditorPage = new FullSiteEditorPage( page );

			await test.step( 'Given I am authenticated', async () => {
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I go to the site editor', async () => {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: true } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			await test.step( 'When I close the navigation sidebar', async () => {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			await test.step( 'When I add a Pullquote block', async () => {
				await fullSiteEditorPage.addBlockFromSidebar(
					'Pullquote',
					'[aria-label="Block: Pullquote"]'
				);
			} );

			await test.step( 'When I delete the Pullquote block from the block toolbar', async () => {
				await fullSiteEditorPage.clickBlockToolbarOption( 'Delete' );
			} );

			await test.step( 'Then "wpcom_block_deleted" event fires', async () => {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_deleted' );
				expect( eventDidFire ).toBe( true );
			} );
		} );
	}
);
