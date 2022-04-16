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
	skipDescribeIf,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor tracking: Global styles events' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

	describe( 'wpcom_block_editor_global_styles_panel_toggle', function () {
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

		it( 'Open site styles', async function () {
			await fullSiteEditorPage.openSiteStyles();
		} );

		it( '"wpcom_block_editor_global_styles_panel_toggle" event fires with "open" === true', async function () {
			const eventDidFire = await editorTracksEventManager.didEventFire(
				'wpcom_block_editor_global_styles_panel_toggle',
				{
					matchingProperties: {
						open: true,
					},
				}
			);
			expect( eventDidFire ).toBe( true );
		} );

		it( 'Close site styles', async function () {
			await fullSiteEditorPage.closeSiteStyles();
		} );

		it( '"wpcom_block_editor_global_styles_panel_toggle" event fires with "open" === false', async function () {
			const eventDidFire = await editorTracksEventManager.didEventFire(
				'wpcom_block_editor_global_styles_panel_toggle',
				{
					matchingProperties: {
						open: false,
					},
				}
			);
			expect( eventDidFire ).toBe( true );
		} );
	} );

	describe( 'wpcom_block_editor_global_styles_menu_selected', function () {
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

		it( 'Open site styles', async function () {
			await fullSiteEditorPage.openSiteStyles();
		} );

		it( 'Click on "Typography" menu button', async function () {
			await fullSiteEditorPage.clickStylesMenuButton( 'Typography' );
		} );

		it( '"wpcom_block_editor_global_styles_menu_selected" event fires with "menu" === "typography"', async function () {
			const eventDidFire = await editorTracksEventManager.didEventFire(
				'wpcom_block_editor_global_styles_menu_selected',
				{
					matchingProperties: {
						menu: 'typography',
					},
				}
			);
			expect( eventDidFire ).toBe( true );
		} );

		it( 'Return to top menu level', async function () {
			await fullSiteEditorPage.returnToStylesTopMenu();
		} );

		it( 'Click on "Blocks" menu button', async function () {
			await fullSiteEditorPage.clickStylesMenuButton( 'Blocks' );
		} );

		it( '"wpcom_block_editor_global_styles_menu_selected" event fires with "menu" === "blocks"', async function () {
			const eventDidFire = await editorTracksEventManager.didEventFire(
				'wpcom_block_editor_global_styles_menu_selected',
				{
					matchingProperties: {
						menu: 'blocks',
					},
				}
			);
			expect( eventDidFire ).toBe( true );
		} );
	} );

	describe( 'wpcom_block_editor_global_styles_update', function () {
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

		it( 'Open site styles', async function () {
			await fullSiteEditorPage.openSiteStyles();
		} );

		describe( 'Updating styles directly', function () {
			it( 'Update the global background color', async function () {
				// We can always guarantee a target color event if we click a different one first.
				await fullSiteEditorPage.setGlobalColorStlye( 'Background', {
					colorName: 'Primary',
				} );
				await fullSiteEditorPage.setGlobalColorStlye( 'Background', {
					colorName: 'Background',
				} );
			} );

			it( '"wpcom_block_editor_global_styles_update" event fires with correct color properties', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_global_styles_update',
					{
						matchingProperties: {
							section: 'color',
							field: 'background',
							field_value: 'var:preset|color|background',
						},
						waitForEventMs: 2 * 1000, // Style update events are debounced
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			it( 'Update the font appearance for the Heading block', async function () {
				// We can always guarantee a target font appearance event if we select a different one first.
				await fullSiteEditorPage.setBlockTypographyStyle( 'Heading', {
					fontAppearance: 'Thin',
				} );
				await fullSiteEditorPage.setBlockTypographyStyle( 'Heading', {
					fontAppearance: 'Medium',
				} );
			} );

			it( '"wpcom_block_editor_global_styles_update" event fires with correct typography properties', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_block_editor_global_styles_update',
					{
						matchingProperties: {
							block_type: 'core/heading',
							section: 'typography',
							field: 'fontWeight',
							field_value: '500',
						},
						waitForEventMs: 2 * 1000, // Style update events are debounced
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		// Can't reset to defaults on mobile
		skipDescribeIf( envVariables.VIEWPORT_NAME === 'mobile' )(
			'Updating by resetting to defaults',
			function () {
				it( 'Reset the Tracks events for a clean slate', async function () {
					await editorTracksEventManager.clearEvents();
				} );

				it( 'Reset styles to defaults for theme', async function () {
					await fullSiteEditorPage.resetStylesToDefaults();
				} );

				it( '"wpcom_block_editor_global_styles_update" event fires with "field_value" === "reset"', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_editor_global_styles_update',
						{
							matchingProperties: {
								field_value: 'reset',
							},
							waitForEventMs: 2 * 1000, // Style update events are debounced
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			}
		);
	} );
} );
