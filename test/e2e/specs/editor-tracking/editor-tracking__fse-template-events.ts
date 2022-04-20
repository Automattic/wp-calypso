/**
 * @group gutenberg
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
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

const createTemplatePartName = () =>
	`TP_${ DataHelper.getTimestamp() }_${ DataHelper.getRandomInteger( 0, 100 ) }`;

describe(
	DataHelper.createSuiteTitle( 'Editor tracking: Site editor template events' ),
	function () {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

		const createdTemplateParts: string[] = [];

		describe( 'wpcom_block_editor_create_template_part', function () {
			let page: Page;
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartBlock: TemplatePartBlock;

			const templatePartName = createTemplatePartName();

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
		} );

		// These events are currently broken :(. See https://github.com/Automattic/wp-calypso/issues/62924.
		describe.skip( 'wpcom_block_editor_template_part_choose_existing/replace', function () {
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

			it( 'Add a Header block', async function () {
				// It's just a Template Part block with a different name in the sidebar.
				const block = await fullSiteEditorPage.addBlockFromSidebar(
					'Header',
					TemplatePartBlock.blockEditorSelector
				);
				headerBlock = new TemplatePartBlock( page, block );
			} );

			it( 'Choose an existing template ("header-minimal")', async function () {
				await headerBlock.clickChoose();
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'header-minimal' );
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

			it( 'Replace template with a different template ("header-linear")', async function () {
				// First, let's make sure we have the right block focused!
				const blockId = await ElementHelper.getIdFromBlock( headerBlock.block );
				await fullSiteEditorPage.focusBlock( `#${ blockId }` );

				// Then we can take block toolabr actions.
				await fullSiteEditorPage.clickBlockToolbarPrimaryButton( { text: 'Replace' } );
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'header-linear' );
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
		} );

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
				for ( const templatePart of createdTemplateParts ) {
					await fullSiteEditorPage.deleteTemplatePart( templatePart );
				}
			}
		} );
	}
);
