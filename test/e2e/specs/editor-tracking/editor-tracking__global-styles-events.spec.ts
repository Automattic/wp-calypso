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
	DataHelper.createSuiteTitle( 'Editor tracking: Global styles events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		// .fixme: the helpers were reworked this round — openSiteStyles now uses the
		// header "Styles" toggle (button[aria-label="Styles"]) and the styles sidebar
		// selectors were updated for the renamed `.editor-global-styles-sidebar`
		// container / "Close Styles" control, so opening and closing the panel works
		// again. What still blocks these tests is product-side tracking that was not
		// updated for the edit-site -> editor rename:
		//   - panel_toggle: the OPEN event fires (id-based enableComplementaryArea),
		//     but the CLOSE event does not — trackDisableComplementaryArea only fires
		//     for scope === 'core/edit-site', while the panel now disables under
		//     'core/editor'.
		//   - menu_selected: dead. wpcom-block-editor-global-styles-menu-selected.js
		//     keys its delegated click selector and its isAtTopLevel guard on the old
		//     '.edit-site-global-styles-sidebar' class, which no longer exists.
		//   - update / save: rely on the same global-styles surface and were not
		//     re-verified once the above two proved dead.
		// Re-enabling needs the wpcom tracking (apps/wpcom-block-editor) re-pointed at
		// the new editor scope/classes; that is product code, out of scope here. The
		// helper fixes are kept so this only needs the product tracking once fixed.
		// See TESTOPS-49.
		test( '"wpcom_block_editor_global_styles_panel_toggle" event fires on open and close', async ( {
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

			await test.step( 'When I open site styles', async () => {
				await fullSiteEditorPage.openSiteStyles();
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_panel_toggle" event fires with "open" === true', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_panel_toggle',
					{
						matchingProperties: { open: true },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I close site styles', async () => {
				await fullSiteEditorPage.closeSiteStyles();
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_panel_toggle" event fires with "open" === false', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_panel_toggle',
					{
						matchingProperties: { open: false },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		// .fixme: depends on the same global-styles panel flow as the
		// panel_toggle test above. Re-enable once the styles helpers are
		// updated for the new site-editor navigation. See TESTOPS-49.
		test( '"wpcom_block_editor_global_styles_menu_selected" event fires for Typography and Blocks', async ( {
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

			await test.step( 'When I open site styles', async () => {
				await fullSiteEditorPage.openSiteStyles();
			} );

			await test.step( 'When I click on "Typography" menu button', async () => {
				await fullSiteEditorPage.clickStylesMenuButton( 'Typography' );
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_menu_selected" event fires with "menu" === "typography"', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_menu_selected',
					{
						matchingProperties: { menu: 'typography' },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I return to top menu level', async () => {
				await fullSiteEditorPage.returnToStylesTopMenu();
			} );

			await test.step( 'When I click on "Blocks" menu button', async () => {
				await fullSiteEditorPage.clickStylesMenuButton( 'Blocks' );
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_menu_selected" event fires with "menu" === "blocks"', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_menu_selected',
					{
						matchingProperties: { menu: 'blocks' },
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );

		// .fixme: depends on the same global-styles panel flow. See TESTOPS-49.
		test( '"wpcom_block_editor_global_styles_update" event fires for color and typography changes', async ( {
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

			await test.step( 'When I open site styles', async () => {
				await fullSiteEditorPage.openSiteStyles();
			} );

			await test.step( 'When I update the global background color', async () => {
				await fullSiteEditorPage.setGlobalColorStyle( 'Background', { colorName: 'Primary' } );
				await fullSiteEditorPage.setGlobalColorStyle( 'Background', {
					colorName: 'Background',
				} );
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_update" event fires with correct color properties', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_update',
					{
						matchingProperties: {
							section: 'color',
							field: 'background',
							field_value: 'var:preset|color|background',
						},
						waitForEventMs: 2 * 1000,
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I update the font appearance for the Heading block', async () => {
				await fullSiteEditorPage.setBlockTypographyStyle( 'Heading', {
					fontAppearance: 'Thin',
				} );
				await fullSiteEditorPage.setBlockTypographyStyle( 'Heading', {
					fontAppearance: 'Medium',
				} );
			} );

			await test.step( 'Then "wpcom_block_editor_global_styles_update" event fires with correct typography properties', async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_block_editor_global_styles_update',
					{
						matchingProperties: {
							block_type: 'core/heading',
							section: 'typography',
							field: 'fontWeight',
							field_value: '500',
						},
						waitForEventMs: 2 * 1000,
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			// Can't reset to defaults on mobile
			if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
				await test.step( 'When I reset Tracks events for a clean slate', async () => {
					await editorTracksEventManager!.clearEvents();
				} );

				await test.step( 'When I reset styles to defaults for theme', async () => {
					await fullSiteEditorPage.resetStylesToDefaults();
				} );

				await test.step( 'Then "wpcom_block_editor_global_styles_update" event fires with "field_value" === "reset"', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_editor_global_styles_update',
						{
							matchingProperties: { field_value: 'reset' },
							waitForEventMs: 2 * 1000,
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			}
		} );

		// .fixme: depends on the same global-styles panel flow. See TESTOPS-49.
		test.describe( '"wpcom_block_editor_global_styles_save" event fires with correct style properties', () => {
			const padding = DataHelper.getRandomInteger( 1, 32 );
			let testAccount: TestAccount;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			test.afterEach( async () => {
				// Reset layout back to empty to protect future runs.
				await fullSiteEditorPage.openSiteStyles();
				await fullSiteEditorPage.resetGlobalLayoutStyle();
				await fullSiteEditorPage.closeSiteStyles();
				await fullSiteEditorPage.save();
			} );

			test( 'event fires with correct style properties', async ( { page } ) => {
				const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );

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

				await test.step( 'When I open site styles', async () => {
					await fullSiteEditorPage.openSiteStyles();
				} );

				await test.step( 'When I set global layout style', async () => {
					await fullSiteEditorPage.setGlobalLayoutStyle( { padding: padding } );
				} );

				await test.step( 'When I save the editor', async () => {
					await fullSiteEditorPage.closeSiteStyles();
					await fullSiteEditorPage.save();
				} );

				await test.step( 'Then "wpcom_block_editor_global_styles_save" event fires with correct style properties', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
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
			} );
		} );
	}
);
