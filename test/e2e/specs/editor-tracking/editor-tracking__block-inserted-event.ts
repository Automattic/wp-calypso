/**
 * @group editor-tracking
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	PageTemplateModalComponent,
	TestAccount,
	EditorTracksEventManager,
	SiteType,
	FullSiteEditorPage,
	TemplatePartBlock,
	OpenInlineInserter,
	HeaderBlock,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';
import type { TracksEventProperties } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Editor tracking: "wpcom_block_inserted" event variations' ),
	function () {
		const features = envToFeatureKey( envVariables );

		describe( 'In the post editor', function () {
			const accountName = getTestAccountByFeature( features );
			let page: Page;
			let editorPage: EditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				editorPage = new EditorPage( page, { target: features.siteType } );
			} );

			it( 'Start a new post', async function () {
				await editorPage.visit( 'post' );
				await editorPage.waitUntilLoaded();
				// We'll be exiting without saving.
				editorPage.allowLeavingWithoutSaving();
			} );

			describe( 'Basic insertion and shared properties', function () {
				it( 'Insert a Heading block from the sidebar', async function () {
					await editorPage.addBlockFromSidebar( 'Heading', '[aria-label="Block: Heading"]' );
				} );

				it( '"wpcom_block_inserted" event fires with expected block-related properties', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: {
								block_name: 'core/heading',
								blocks_replaced: false,
								insert_method: 'header-inserter',
								inner_block: false,
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );

				describe( 'Validating properties shared among events', function () {
					// We're taking a different approach here and first finding the event, then checking properties one-by-one.
					// This is done for two reasons:
					//   1. We are validating a lot of shared, required properties. Granular failing is helpful.
					//   2. For stability, some of these properties (e.g. blog_id) are best done with "soft" assertions.

					// Our current list doesn't include GB english, which is on some of our test sites.
					// Adding that here so we don't accidentally expand our i18n tests.
					const expectedLocales = new Set( [ ...DataHelper.getMag16Locales(), 'en-gb' ] );
					const numericRegex = /^\d+$/;

					let tracksEventProperties: TracksEventProperties;
					beforeAll( async function () {
						[ , tracksEventProperties ] = await editorTracksEventManager.getMostRecentMatchingEvent(
							'wpcom_block_inserted'
						);
					} );

					it( '"editor_type" is "post"', async function () {
						expect( tracksEventProperties.editor_type ).toBe( 'post' );
					} );

					it( '"post_type" is "post"', async function () {
						expect( tracksEventProperties.post_type ).toBe( 'post' );
					} );

					it( '"blog_id" is a numeric value', async function () {
						expect( numericRegex.test( tracksEventProperties.blog_id.toString() ) ).toBe( true );
					} );

					it( '"site_type" matches the current site type', async function () {
						const expectedSiteType: SiteType = envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple';
						expect( tracksEventProperties.site_type ).toBe( expectedSiteType );
					} );

					it( '"user_locale" is a valid locale', async function () {
						expect( expectedLocales.has( tracksEventProperties.user_locale.toString() ) ).toBe(
							true
						);
					} );

					it( '"blog_tz" is a numeric value', async function () {
						expect( numericRegex.test( tracksEventProperties.blog_tz.toString() ) ).toBe( true );
					} );

					it( '"user_lang" is a valid locale', async function () {
						expect( expectedLocales.has( tracksEventProperties.user_lang.toString() ) ).toBe(
							true
						);
					} );

					it( '"blog_lang" is a valid locale', async function () {
						expect( expectedLocales.has( tracksEventProperties.blog_lang.toString() ) ).toBe(
							true
						);
					} );
				} );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'In the page editor', function () {
			const accountName = getTestAccountByFeature( features );
			let page: Page;
			let editorPage: EditorPage;
			let editorTracksEventManager: EditorTracksEventManager;

			beforeAll( async () => {
				page = await browser.newPage();

				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				editorPage = new EditorPage( page, { target: features.siteType } );
			} );

			it( 'Start a new page', async function () {
				await editorPage.visit( 'page' );
				await editorPage.waitUntilLoaded();
				// We'll be leaving without saving here too.
				editorPage.allowLeavingWithoutSaving();
			} );

			it( 'Clear the current Tracks events for a clean slate', async function () {
				await editorTracksEventManager.clearEvents();
			} );

			describe( 'From adding a page template', function () {
				it( 'Add "Two column about me layout" page template', async function () {
					// @TODO Consider moving this to EditorPage.
					const editorWindowLocator = editorPage.getEditorWindowLocator();
					const pageTemplateModalComponent = new PageTemplateModalComponent(
						page,
						editorWindowLocator
					);
					await pageTemplateModalComponent.selectTemplateCategory( 'About' );
					await pageTemplateModalComponent.selectTemplate( 'Two column about me layout' );
				} );

				it( '"wpcom_block_inserted" event fires with "from_template_selector" set to true', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: { from_template_selector: true },
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			} );

			it( 'Close the page', async function () {
				await page.close();
			} );
		} );

		describe( 'In the site editor', function () {
			const accountName = getTestAccountByFeature( { ...features, variant: 'siteEditor' } );
			let testAccount: TestAccount;
			let templatePartName: string;

			let page: Page;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartBlock: TemplatePartBlock;
			let headerBlock: TemplatePartBlock;

			beforeAll( async () => {
				page = await browser.newPage();

				testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );

				editorTracksEventManager = new EditorTracksEventManager( page );
				fullSiteEditorPage = new FullSiteEditorPage( page, { target: features.siteType } );
			} );

			afterAll( async () => {
				// Always try to delete the created template part.
				if ( templatePartName ) {
					await fullSiteEditorPage.deleteTemplateParts( [ templatePartName ] );
				}
			} );

			it( 'Visit the site editor', async function () {
				await fullSiteEditorPage.visit( testAccount.getSiteURL( { protocol: false } ) );
				await fullSiteEditorPage.prepareForInteraction( { leaveWithoutSaving: true } );
			} );

			it( 'Close the navigation sidebar', async function () {
				await fullSiteEditorPage.closeNavSidebar();
			} );

			// A lot of block insertions sometimes happen on load
			it( 'Clear the event stack for a starting clean slate', async function () {
				await editorTracksEventManager.clearEvents();
			} );

			describe( 'Adding blocks to templates and template parts', function () {
				it( 'Add a Template Part block', async function () {
					const block = await fullSiteEditorPage.addBlockFromSidebar(
						TemplatePartBlock.blockName,
						TemplatePartBlock.blockEditorSelector
					);
					templatePartBlock = new TemplatePartBlock( page, block );
				} );

				it( '"wpcom_block_inserted" event fires with "entity_context" === "template"', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: {
								block_name: 'core/template-part',
								entity_context: 'template',
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );

				it( 'Create a new Template Part', async function () {
					templatePartName = `TP-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
						0,
						100
					) }`;
					await templatePartBlock.clickStartBlank();
					await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
				} );

				it( 'Add a Page List block to the template part', async function () {
					const openInlineInserter: OpenInlineInserter = async () => {
						await templatePartBlock.clickAddBlockButton();
					};
					await fullSiteEditorPage.addBlockInline(
						'Page List',
						'[aria-label="Block: Page List"]',
						openInlineInserter
					);
				} );

				it( '"wpcom_block_inserted" event fires with correct "entity_context" and "template_part_id"', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: {
								block_name: 'core/page-list',
								entity_context: 'core/template-part',
								template_part_id: `pub/twentytwentytwo//${ templatePartName.toLowerCase() }`,
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			} );

			describe.skip( 'Adding blocks from existing template parts', function () {
				it( 'Add a Header block', async function () {
					const block = await fullSiteEditorPage.addBlockFromSidebar(
						HeaderBlock.blockName,
						HeaderBlock.blockEditorSelector
					);
					headerBlock = new HeaderBlock( page, block );
				} );

				it( 'Clear the event stack again for clean slate', async function () {
					await editorTracksEventManager.clearEvents();
				} );

				it( 'Choose an existing theme template part (header-centered)', async function () {
					await headerBlock.clickChoose();
					await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'header-centered' );
				} );

				// The wp_block_inserted event does fire here because the
				// header block selected above includes a core/page-list
				// block, which triggers wpcom_block_inserted. This is
				// arguably a reasonable outcome. We need to decide whether
				// to adjust the test to match the tracking behavior or adjust
				// the underlyting tracking behavior.
				it( '"wpcom_block_instered" event does NOT fire', async function () {
					const eventDidFire = await editorTracksEventManager.didEventFire(
						'wpcom_block_inserted'
					);
					expect( eventDidFire ).toBe( false );
				} );
			} );
		} );
	}
);
