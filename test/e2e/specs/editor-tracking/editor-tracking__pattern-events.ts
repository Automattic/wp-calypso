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
			// @TODO Consider moving this to EditorPage.
			const editorWindowLocator = editorPage.getEditorWindowLocator();
			const pageTemplateModalComponent = new PageTemplateModalComponent(
				page,
				editorWindowLocator
			);
			await pageTemplateModalComponent.selectBlankPage();
		} );

		describe( 'From the sidebar inserter', function () {
			// Distinct pattern name that returns only one result.
			const patternName = 'Simple Two Column Layout';
			const patternNameInEventProperty = 'a8c/simple-two-column-layout';

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
			const patternName = 'About Me Card';
			const patternNameInEventProperty = 'a8c/about-me-card';

			it( 'Clear event stack for clean slate', async function () {
				await eventManager.clearEvents();
			} );

			it( 'Add pattern from inline inserter', async function () {
				const selector = 'button[aria-label="Add block"]';
				const inserterLocator = await editorPage.getLocatorToSelector( selector );
				if ( ! inserterLocator ) {
					throw new Error( `Selector ${ selector } did not match any valid selector.` );
				}

				// The code pattern here is different compared to above because
				// we are mid-refactor.
				// See https://github.com/Automattic/wp-calypso/pull/72112 for
				// the parent PR that triggered this refactor.
				await editorPage.addPatternInline( patternName, inserterLocator );
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
