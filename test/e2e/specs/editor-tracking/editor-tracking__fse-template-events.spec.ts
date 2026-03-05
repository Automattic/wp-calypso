import {
	DataHelper,
	EditorTracksEventManager,
	ElementHelper,
	FullSiteEditorPage,
	HeaderBlock,
	TemplatePartBlock,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

const createTemplatePartName = () =>
	`TP-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger( 0, 100 ) }`;

test.describe.fixme(
	DataHelper.createSuiteTitle( 'Editor tracking: Site editor template events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

		test.describe( '"wpcom_block_editor_create_template_part" event fires', () => {
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartBlock: TemplatePartBlock;
			let templatePartName: string;

			test.afterEach( async () => {
				if ( templatePartName ) {
					await fullSiteEditorPage.deleteTemplateParts( [ templatePartName ] );
				}
			} );

			test( 'event fires after creating a template part', async ( { page } ) => {
				await test.step( 'Given I am authenticated', async () => {
					testAccount = new TestAccount( accountName );
					await testAccount.authenticate( page );
					editorTracksEventManager = new EditorTracksEventManager( page );
					fullSiteEditorPage = new FullSiteEditorPage( page );
					templatePartName = createTemplatePartName();
				} );

				await test.step( 'When I visit the site editor', async () => {
					await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
					await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
				} );

				await test.step( 'When I close the navigation sidebar', async () => {
					await fullSiteEditorPage.closeNavSidebar();
				} );

				await test.step( 'When I add a Template Part block', async () => {
					const block = await fullSiteEditorPage.addBlockFromSidebar(
						TemplatePartBlock.blockName,
						TemplatePartBlock.blockEditorSelector
					);
					templatePartBlock = new TemplatePartBlock( page, block );
				} );

				await test.step( 'When I create a new template part', async () => {
					await templatePartBlock!.clickStartBlank();
					await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
				} );

				await test.step( 'Then "wpcom_block_editor_create_template_part" event fires', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_editor_create_template_part'
					);
					expect( eventDidFire ).toBe( true );
				} );
			} );
		} );

		test( '"wpcom_block_editor_template_part_choose_existing" and "replace" events fire correctly', async ( {
			page,
		} ) => {
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let headerBlock: TemplatePartBlock;

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

			await test.step( 'When I add a Header block', async () => {
				const block = await fullSiteEditorPage.addBlockFromSidebar(
					HeaderBlock.blockName,
					HeaderBlock.blockEditorSelector
				);
				headerBlock = new HeaderBlock( page, block );
			} );

			await test.step( 'When I choose an existing template ("Header (Dark, small)")', async () => {
				await headerBlock!.clickChoose();
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'Header (Dark, small)' );
			} );

			await test.step( 'Then "wpcom_block_editor_template_part_choose_existing" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_template_part_choose_existing'
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'Then "wpcom_block_editor_template_part_replace" event does NOT fire', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_template_part_replace'
				);
				expect( eventDidFire ).toBe( false );
			} );

			await test.step( 'When I clear events for a clean slate', async () => {
				await editorTracksEventManager!.clearEvents();
			} );

			await test.step( 'When I replace template with a different template ("Header (Dark, large)")', async () => {
				const blockId = await ElementHelper.getIdFromBlock( headerBlock!.block );
				await fullSiteEditorPage.focusBlock( `#${ blockId }` );
				await fullSiteEditorPage.clickBlockToolbarOption( 'Replace Header (Dark, small)' );
				await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'Header (Dark, large)' );
			} );

			await test.step( 'Then "wpcom_block_editor_template_part_replace" event fires', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_template_part_replace'
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'Then "wpcom_block_editor_template_part_choose_existing" event does NOT fire', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_template_part_choose_existing'
				);
				expect( eventDidFire ).toBe( false );
			} );
		} );

		test.describe( '"wpcom_block_editor_convert_to_template_part" and "detach_blocks" events fire correctly', () => {
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartName: string;

			test.afterEach( async () => {
				if ( templatePartName ) {
					await fullSiteEditorPage.deleteTemplateParts( [ templatePartName ] );
				}
			} );

			test( 'convert and detach events fire with correct properties', async ( { page } ) => {
				await test.step( 'Given I am authenticated', async () => {
					testAccount = new TestAccount( accountName );
					await testAccount.authenticate( page );
					editorTracksEventManager = new EditorTracksEventManager( page );
					fullSiteEditorPage = new FullSiteEditorPage( page );
					templatePartName = createTemplatePartName();
				} );

				await test.step( 'When I visit the site editor', async () => {
					await fullSiteEditorPage.visit( testAccount!.getSiteURL( { protocol: true } ) );
					await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
				} );

				await test.step( 'When I close the navigation sidebar', async () => {
					await fullSiteEditorPage.closeNavSidebar();
				} );

				await test.step( 'When I add a Page List block', async () => {
					await fullSiteEditorPage.addBlockFromSidebar(
						'Page List',
						'[aria-label="Block: Page List"]'
					);
				} );

				await test.step( 'When I convert to a template part', async () => {
					await fullSiteEditorPage.clickBlockToolbarOption( 'Create Template part' );
					await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
					await fullSiteEditorPage.waitForConfirmationToast( 'Template part created' );
				} );

				await test.step( 'Then "wpcom_block_editor_convert_to_template_part" event fires with correct "block_names"', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_editor_convert_to_template_part',
						{
							matchingProperties: {
								block_names: 'core/page-list',
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );

				await test.step( 'When I detach the blocks from the newly created template part', async () => {
					await fullSiteEditorPage.clickBlockToolbarOption( 'Detach blocks from template part' );
				} );

				await test.step( 'Then "wpcom_block_editor_template_part_detach_blocks" event fires with correct properties', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_editor_template_part_detach_blocks',
						{
							matchingProperties: {
								block_names: 'core/page-list',
								template_part_id: `pub/twentytwentytwo//${ templatePartName!.toLowerCase() }`,
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			} );
		} );
	}
);
