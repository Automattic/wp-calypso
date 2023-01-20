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
import { skipDescribeIf } from '../../jest-helpers';

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

		it( 'Close the navigation sidebar', async function () {
			await fullSiteEditorPage.closeNavSidebar();
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

		it( 'Close the page', async function () {
			await page.close();
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

		it( 'Close the navigation sidebar', async function () {
			await fullSiteEditorPage.closeNavSidebar();
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

		it( 'Close the page', async function () {
			await page.close();
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

		it( 'Close the navigation sidebar', async function () {
			await fullSiteEditorPage.closeNavSidebar();
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

		it( 'Close the page', async function () {
			await page.close();
		} );
	} );

	describe( 'wpcom_block_editor_global_styles_save', function () {
		let page: Page;
		let testAccount: TestAccount;
		let fullSiteEditorPage: FullSiteEditorPage;
		let editorTracksEventManager: EditorTracksEventManager;

		// We must make sure we have a new value to trigger the editor "dirty" state and enable saving.
		// The main way we do that is by resetting the layouts at the end of each run.
		// But, for the rare race condition we open the editor right as another test run is in the between state,
		// we add some randomness to our padding. This makes it extraordinarily rare to have an unsavable state!
		const padding = DataHelper.getRandomInteger( 1, 32 );

		beforeAll( async () => {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			editorTracksEventManager = new EditorTracksEventManager( page );
			fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
		} );

		afterAll( async function () {
			// Reset the layout back to empty to protect future runs.
			// You can reset an already empty layout, so this is safe to do even if saving didn't go through.
			await fullSiteEditorPage.openSiteStyles();
			await fullSiteEditorPage.resetGlobalLayoutStyle();
			await fullSiteEditorPage.closeSiteStyles();
			await fullSiteEditorPage.save();
		} );

		it( 'Visit the site editor', async function () {
			await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
			await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
		} );

		it( 'Close the navigation sidebar', async function () {
			await fullSiteEditorPage.closeNavSidebar();
		} );

		it( 'Open site styles', async function () {
			await fullSiteEditorPage.openSiteStyles();
		} );

		it( 'Set global layout style', async function () {
			await fullSiteEditorPage.setGlobalLayoutStyle( { padding: padding } );
		} );

		it( 'Save the editor', async function () {
			// On mobile, site styles is a popover panel that blocks the Save button.
			// So let's always close site styles first to be safe. :)
			await fullSiteEditorPage.closeSiteStyles();
			await fullSiteEditorPage.save();
		} );

		it( '"wpcom_block_editor_global_styles_save" event fires with correct style properties', async function () {
			const eventDidFire = await editorTracksEventManager.didEventFire(
				'wpcom_block_editor_global_styles_save',
				{
					matchingProperties: {
						section: 'spacing',
						field: 'padding',
						field_value: `${ padding }px`,
					},
				}
			);
			expect( eventDidFire ).toBe( true );
		} );

		it( 'Close the page', async function () {
			await page.close();
		} );
	} );
} );
