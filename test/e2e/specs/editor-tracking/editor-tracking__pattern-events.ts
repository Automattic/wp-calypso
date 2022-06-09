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
	OpenInlineInserter,
	EditorGutenbergComponent,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor tracking: Pattern-related events' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	describe( 'wpcom_pattern_inserted', function () {
		let page: Page;
		let editorPage: EditorPage;
		let eventManager: EditorTracksEventManager;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			eventManager = new EditorTracksEventManager( page );
			editorPage = new EditorPage( page, { target: features.siteType } );
		} );

		it( 'Start a new page', async function () {
			await editorPage.visit( 'page' );
			await editorPage.waitUntilLoaded();
		} );

		it( 'Select blank template from modal', async function () {
			const editorFrame = await editorPage.getEditorHandle();
			const pageTemplateModalComponent = new PageTemplateModalComponent( editorFrame, page );
			await pageTemplateModalComponent.selectBlankPage();
		} );

		describe( 'From the sidebar inserter', function () {
			const patternName = 'Two columns of text and title'; // This is distinct and returns one result.
			const patternNameInEventProperty = 'core/two-columns-of-text-and-title';

			it( 'Add pattern from sidebar inserter', async function () {
				await editorPage.addPatternFromSidebar( patternName );
			} );

			it( '"wpcom_pattern_inserted" event is added with correct "pattern_name" property', async function () {
				const eventDidFire = await eventManager.didEventFire( 'wpcom_pattern_inserted', {
					matchingProperties: {
						pattern_name: patternNameInEventProperty,
					},
				} );
				expect( eventDidFire ).toBe( true );
			} );
		} );

		describe( 'From the inline inserter', function () {
			// We use a different pattern here for distinction.
			// This especially helps distinguish the toast popups that confirm patter insertion.
			const patternName = 'Pricing table'; // This returns one result.
			const patternNameInEventProperty = 'pricing-table';

			it( 'Clear event stack for clean slate', async function () {
				await eventManager.clearEvents();
			} );

			it( 'Add pattern from inline inserter', async function () {
				const openInlineInserter: OpenInlineInserter = async ( editor ) => {
					const editorGutenbergComponent = new EditorGutenbergComponent( page, editor );
					// This is the best way to get the append block button to appear
					await editorGutenbergComponent.resetSelectedBlock();

					const appendBlockButtonLocator = editor.locator(
						'.block-list-appender button[aria-label="Add block"]'
					);
					await appendBlockButtonLocator.click();
				};

				await editorPage.addPatternInline( patternName, openInlineInserter );
			} );

			it( '"wpcom_pattern_inserted" event is added with correct "pattern_name" property', async function () {
				const eventDidFire = await eventManager.didEventFire( 'wpcom_pattern_inserted', {
					matchingProperties: {
						pattern_name: patternNameInEventProperty,
					},
				} );
				expect( eventDidFire ).toBe( true );
			} );
		} );
	} );
} );
