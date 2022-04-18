/**
 * @group gutenberg
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
	TracksEventProperties,
	SiteType,
	TEST_LOCALES,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor tracking: Block-related events' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	describe( 'wpcom_block_inserted', function () {
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

		describe( 'Basic insertion and shared properties', function () {
			it( 'Start a new post', async function () {
				await editorPage.visit( 'post' );
				await editorPage.waitUntilLoaded();
				// We'll be exiting without saving.
				editorPage.allowLeavingWithoutSaving();
			} );

			it( 'Insert a Heading block from the sidebar', async function () {
				await editorPage.addBlockFromSidebar( 'Heading', '[aria-label="Block: Heading"]' );
			} );

			it( '"wpcom_block_inserted" event fires with expected block-related properties', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_inserted', {
					matchingProperties: {
						block_name: 'core/heading',
						blocks_replaced: false,
						insert_method: 'header-inserter',
						inner_block: false,
					},
				} );
				expect( eventDidFire ).toBe( true );
			} );

			describe( 'Validating properties shared among events', function () {
				// We're taking a different approach here and first finding the event, then checking properties one-by-one.
				// This is done for two reasons:
				//   1. We are validating a lot of shared, required properties. Granular failing is helpful.
				//   2. For stability, some of these properties (e.g. blog_id) are best done with "soft" assertions.

				// Our current list doesn't include GB english, which is on some of our test sites.
				// Adding that here so we don't accidentally expand our i18n tests.
				const expectedLocales = new Set( [ ...TEST_LOCALES, 'en-gb' ] );
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
					expect( numericRegex.test( tracksEventProperties.blog_id ) ).toBe( true );
				} );

				it( '"site_type" matches the current site type', async function () {
					const expectedSiteType: SiteType = envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple';
					expect( tracksEventProperties.site_type ).toBe( expectedSiteType );
				} );

				it( '"user_locale" is a valid locale', async function () {
					expect( expectedLocales.has( tracksEventProperties.user_locale ) ).toBe( true );
				} );

				it( '"blog_tz" is a numeric value', async function () {
					expect( numericRegex.test( tracksEventProperties.blog_tz ) ).toBe( true );
				} );

				it( '"user_lang" is a valid locale', async function () {
					expect( expectedLocales.has( tracksEventProperties.user_lang ) ).toBe( true );
				} );

				it( '"blog_lang" is a valid locale', async function () {
					expect( expectedLocales.has( tracksEventProperties.blog_lang ) ).toBe( true );
				} );
			} );
		} );

		describe( 'Added from a page template', function () {
			it( 'Start a new page', async function () {
				await editorPage.visit( 'page' );
				await editorPage.waitUntilLoaded();
				// We'll be leaving without saving here too.
				editorPage.allowLeavingWithoutSaving();
			} );

			it( 'Clear the current Tracks events for a clean slate', async function () {
				await editorTracksEventManager.clearEvents();
			} );

			it( 'Add "Two column about me layout" page template', async function () {
				const editorFrame = await editorPage.getEditorHandle();
				const pageTemplateModalComponent = new PageTemplateModalComponent( editorFrame, page );
				await pageTemplateModalComponent.selectTemplateCatagory( 'About' );
				await pageTemplateModalComponent.selectTemplate( 'Two column about me layout' );
			} );

			it( '"wpcom_block_inserted" event fires with "from_template_selector" set to true', async function () {
				const eventDidFire = await editorTracksEventManager.didEventFire( 'wpcom_block_inserted', {
					matchingProperties: { from_template_selector: true },
				} );
				expect( eventDidFire ).toBe( true );
			} );
		} );
	} );
} );
