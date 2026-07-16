import {
	DataHelper,
	EditorTracksEventManager,
	FullSiteEditorPage,
	HeaderBlock,
	OpenInlineInserter,
	SiteType,
	TemplatePartBlock,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import type { TracksEventProperties } from '@automattic/calypso-e2e';

test.describe(
	DataHelper.createSuiteTitle( 'Editor tracking: "wpcom_block_inserted" event variations' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		test( 'In the post editor: block inserted event fires correctly', async ( {
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

			await test.step( 'When I insert a Heading block from the sidebar', async () => {
				// Heading blocks expose their level in the aria-label when selected
				// (e.g. "Block: Heading 2"), so match the prefix.
				await pageEditor.addBlockFromSidebar( 'Heading', '[aria-label^="Block: Heading"]' );
			} );

			await test.step( '"wpcom_block_inserted" event fires with expected block-related properties', async () => {
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

			await test.step( 'Then shared event properties are valid', async () => {
				const expectedLocales = new Set( [ ...DataHelper.getMag16Locales(), 'en-gb' ] );
				const numericRegex = /^\d+$/;

				const [ , tracksEventProperties ] =
					await editorTracksEventManager.getMostRecentMatchingEvent( 'wpcom_block_inserted' );
				const props = tracksEventProperties as TracksEventProperties;

				expect( props.editor_type ).toBe( 'post' );
				expect( props.post_type ).toBe( 'post' );
				expect( numericRegex.test( props.blog_id.toString() ) ).toBe( true );
				const expectedSiteType: SiteType = envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple';
				expect( props.site_type ).toBe( expectedSiteType );
				expect( expectedLocales.has( props.user_locale.toString() ) ).toBe( true );
				expect( numericRegex.test( props.blog_tz.toString() ) ).toBe( true );
				expect( expectedLocales.has( props.user_lang.toString() ) ).toBe( true );
				expect( expectedLocales.has( props.blog_lang.toString() ) ).toBe( true );
			} );
		} );

		// .fixme: confirmed this round — on a freshly created page there is no
		// auto-opening template/pattern selector at all (no `listbox`, no
		// "Choose a pattern"/template trigger button on the page), so the
		// wpcom_block_inserted "from_template_selector" path cannot be exercised as
		// written. The page-start pattern modal this relied on is no longer present
		// for this theme/account; reproducing the event needs a new trigger (and
		// confirmation the product still emits from_template_selector at all).
		// Needs revisit. See TESTOPS-49.
		test.fixme(
			'In the page editor: block inserted event fires from template selector',
			async ( { page, pageEditor } ) => {
				const accountName = getTestAccountByFeature( features );
				let editorTracksEventManager: EditorTracksEventManager;
				let siteSlug: string;

				await test.step( 'Given I am authenticated', async () => {
					const testAccount = new TestAccount( accountName );
					await testAccount.authenticate( page );
					siteSlug = testAccount.getSiteURL( { protocol: false } );
					editorTracksEventManager = new EditorTracksEventManager( page );
				} );

				await test.step( 'When I start a new page', async () => {
					await pageEditor.visit( 'page', { siteSlug } );
					await pageEditor.waitUntilLoaded();
					pageEditor.allowLeavingWithoutSaving();
				} );

				await test.step( 'When I clear Tracks events for a clean slate', async () => {
					await editorTracksEventManager!.clearEvents();
				} );

				await test.step( 'When I add a page template', async () => {
					const editorParent = await pageEditor.getEditorParent();
					const inserterSelector = editorParent.getByRole( 'listbox', { name: 'All' } );
					const modalSelector = editorParent.getByRole( 'listbox', {
						name: 'Block patterns',
					} );
					const firstPattern = inserterSelector.or( modalSelector ).getByRole( 'option' ).first();
					await pageEditor.selectTemplate( firstPattern, { timeout: 15 * 1000 } );
				} );

				await test.step( 'Then "wpcom_block_inserted" event fires with "from_template_selector" set to true', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: { from_template_selector: true },
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			}
		);

		test.describe( 'In the site editor', () => {
			let testAccount: TestAccount;
			let templatePartName: string;
			let fullSiteEditorPage: FullSiteEditorPage;
			let editorTracksEventManager: EditorTracksEventManager;
			let templatePartBlock: TemplatePartBlock;
			let headerBlock: HeaderBlock;

			test.afterEach( async () => {
				if ( templatePartName ) {
					await fullSiteEditorPage.deleteTemplateParts( [ templatePartName ] );
				}
			} );

			// .fixme: closing the nav sidebar, the first template-part insertion event,
			// and the afterEach deleteTemplateParts cleanup all work now (the
			// nav-sidebar/DataViews helpers were updated under TESTOPS-49). Two blockers
			// remain, the same ones that keep the fse-template "convert/detach" suite
			// deferred: (1) the inline "Add block" button inside a freshly-created
			// Template Part is no longer where TemplatePartBlock.clickAddBlockButton
			// looks, so the Page List insertion times out; (2) the final assertion
			// hardcodes a `pub/twentytwentytwo//...` template_part_id, which is
			// theme-specific and likely wrong for the current site theme. Needs the
			// add-block-in-template-part flow re-targeted and a theme-agnostic
			// template_part_id assertion. See TESTOPS-49.
			test.fixme( 'block inserted event fires with entity_context', async ( { page } ) => {
				const siteEditorAccountName = getTestAccountByFeature( {
					...features,
					variant: 'siteEditor',
				} );

				await test.step( 'Given I am authenticated', async () => {
					testAccount = new TestAccount( siteEditorAccountName );
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

				await test.step( 'When I clear event stack for a starting clean slate', async () => {
					await editorTracksEventManager!.clearEvents();
				} );

				await test.step( 'When I add a Template Part block', async () => {
					const block = await fullSiteEditorPage.addBlockFromSidebar(
						TemplatePartBlock.blockName,
						TemplatePartBlock.blockEditorSelector
					);
					templatePartBlock = new TemplatePartBlock( page, block );
				} );

				await test.step( 'Then "wpcom_block_inserted" event fires with "entity_context" === "template"', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
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

				await test.step( 'When I create a new Template Part', async () => {
					templatePartName = `TP-${ DataHelper.getTimestamp() }-${ DataHelper.getRandomInteger(
						0,
						100
					) }`;
					await templatePartBlock!.clickStartBlank();
					await fullSiteEditorPage.nameAndFinalizeTemplatePart( templatePartName );
				} );

				await test.step( 'When I add a Page List block to the template part', async () => {
					const openInlineInserter: OpenInlineInserter = async () => {
						await templatePartBlock!.clickAddBlockButton();
					};
					await fullSiteEditorPage.addBlockInline(
						'Page List',
						'[aria-label="Block: Page List"]',
						openInlineInserter
					);
				} );

				await test.step( 'Then "wpcom_block_inserted" event fires with correct "entity_context" and "template_part_id"', async () => {
					const eventDidFire = await editorTracksEventManager!.didEventFire(
						'wpcom_block_inserted',
						{
							matchingProperties: {
								block_name: 'core/page-list',
								entity_context: 'core/template-part',
								template_part_id: `pub/twentytwentytwo//${ templatePartName!.toLowerCase() }`,
							},
						}
					);
					expect( eventDidFire ).toBe( true );
				} );
			} );

			// The wpcom_block_inserted event does fire here because the header block selected
			// includes a core/page-list block, which triggers wpcom_block_inserted. This is
			// arguably a reasonable outcome. We need to decide whether to adjust the test to
			// match the tracking behavior or adjust the underlying tracking behavior.
			test.describe.skip( 'Adding blocks from existing template parts', () => {
				test( '"wpcom_block_inserted" event does NOT fire when choosing an existing template part', async ( {
					page,
				} ) => {
					const siteEditorAccountName = getTestAccountByFeature( {
						...features,
						variant: 'siteEditor',
					} );

					await test.step( 'Given I am authenticated', async () => {
						testAccount = new TestAccount( siteEditorAccountName );
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

					await test.step( 'When I clear the event stack for a clean slate', async () => {
						await editorTracksEventManager!.clearEvents();
					} );

					await test.step( 'When I choose an existing theme template part ("header-centered")', async () => {
						await headerBlock!.clickChoose();
						await fullSiteEditorPage.selectExistingTemplatePartFromModal( 'header-centered' );
					} );

					await test.step( 'Then "wpcom_block_inserted" event does NOT fire', async () => {
						const eventDidFire =
							await editorTracksEventManager!.didEventFire( 'wpcom_block_inserted' );
						expect( eventDidFire ).toBe( false );
					} );
				} );
			} );
		} );
	}
);
