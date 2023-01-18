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
	TemplatePartBlock,
	ElementHelper,
	HeaderBlock,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

const createTemplatePartName = () =>
	`TP-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger( 0, 100 ) }`;

describe(
	DataHelper.createSuiteTitle( 'Editor tracking: Site editor template events' ),
	function () {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

		const createdTemplateParts: string[] = [];

		afterAll( async function () {
			if ( createdTemplateParts.length > 0 ) {
				// Template part data cleanup
				const page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				const fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );

				console.info( `Deleting created template parts: ${ createdTemplateParts.join( ', ' ) }` );
				await fullSiteEditorPage.deleteTemplateParts( createdTemplateParts );
			}
		} );

		describe( 'wpcom_block_editor_create_template_part', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartBlock: TemplatePartBlock;

			let templatePartName: string;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );

				templatePartName = createTemplatePartName();
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Add a Template Part block', async function () {
				const block = await fullSiteEditorPage.addBlockFromSidebar(
					TemplatePartBlock.blockName,
					TemplatePartBlock.blockEditorSelector
				);
				templatePartBlock = new TemplatePartBlock( page, block );
			} );

			it( 'Create a new template part', async function () {
				await templatePartBlock.clickStartBlank();
				await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
				createdTemplateParts.push( templatePartName );
			} );

			it( '"wpcom_block_editor_create_template_part" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_create_template_part'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_block_editor_template_part_choose_existing/replace', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let headerBlock: TemplatePartBlock;

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

			it( 'Add a Header block', async function () {
				// It's just a Template Part block with a different name in the sidebar, so we can re-use that POM class.
				const block = await fullSiteEditorPage.addBlockFromSidebar(
					HeaderBlock.blockName,
					HeaderBlock.blockEditorSelector
				);
				headerBlock = new HeaderBlock( page, block );
			} );

			it( 'Choose an existing template ("Header (Dark, small)")', async function () {
				await headerBlock.clickChoose();
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'Header (Dark, small)' );
			} );

			it( '"wpcom_block_editor_template_part_choose_existing" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_template_part_choose_existing'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( '"wpcom_block_editor_template_part_replace" event does NOT fire', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_template_part_replace'
				);
				expect( eventDidFire ).toBe( false );
			} );

			it( 'Clear events for a clean slate', async function () {
				await editorTracksEventManager.clearEvents();
			} );

			it( 'Replace template with a different template ("Header (Dark, large)")', async function () {
				// First, let's make sure we have the right block focused!
				const blockId = await ElementHelper.getIdFromBlock( headerBlock.block );
				await fullSiteEditorPage.focusBlock( `#${ blockId }` );

				// Then we can take block toolbar actions.
				await fullSiteEditorPage.clickBlockToolbarOption( 'Replace Header (Dark, small)' );
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'Header (Dark, large)' );
			} );

			it( '"wpcom_block_editor_template_part_replace" event fires', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_template_part_replace'
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( '"wpcom_block_editor_template_part_choose_existing" event does NOT fire', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_template_part_choose_existing'
				);
				expect( eventDidFire ).toBe( false );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'wpcom_block_editor_convert_to_template_part / wpcom_block_editor_template_part_detach_blocks', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			let templatePartName: string;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );

				templatePartName = createTemplatePartName();
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			it( 'Add a Page List block', async function () {
				await fullSiteEditorPage.addBlockFromSidebar(
					'Page List',
					'[aria-label="Block: Page List"]'
				);
			} );

			it( 'Convert to a template part', async function () {
				// Page List block should already be focused due to just adding it.
				await fullSiteEditorPage.clickBlockToolbarOption( 'Create Template part' );
				await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
				// This toast in unique to conversion. It doesn't fire during other creation flows..
				await fullSiteEditorPage.waitForConfirmationToast( 'Template part created' );
				createdTemplateParts.push( templatePartName );
			} );

			it( '"wpcom_block_editor_convert_to_template_part" event fires with correct "block_names"', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_convert_to_template_part',
					{
						matchingProperties: {
							block_names: 'core/page-list',
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Detach the blocks from the newly create template part', async function () {
				// After creation, the new Template Part block should already be focused.
				await fullSiteEditorPage.clickBlockToolbarOption( 'Detach blocks from template part' );
			} );

			it( '"wpcom_block_editor_template_part_detach_blocks" event fires with correct "block_names" and "template_part_id"', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_template_part_detach_blocks',
					{
						matchingProperties: {
							block_names: 'core/page-list',
							// Event property values are always lower case.
							template_part_id: `pub/twentytwentytwo//${ templatePartName.toLowerCase() }`,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );
	}
);
