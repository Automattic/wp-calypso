/**
 * @group gutenberg
 */

import {
	DataHelper,
	EditorPage,
	envVariables,
	getTestAccountByFeature,
	PageTemplateModalComponent,
	TestAccount,
	EditorTracksEventManager,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Editor tracking: Pattern-related events' ), function () {
	const siteType = envVariables.TEST_ON_ATOMIC ? 'atomic' : 'simple';
	const accountName = getTestAccountByFeature( {
		gutenberg: envVariables.GUTENBERG_EDGE ? 'edge' : 'stable',
		siteType: siteType,
	} );

	const patternName = 'Two columns of text and title'; // This is distinct and returns one result.
	const patternNameInEventProperty = 'core/two-columns-of-text-and-title';

	describe( 'wpcom_pattern_inserted', function () {
		let page: Page;
		let editorPage: EditorPage;
		let eventManager: EditorTracksEventManager;

		beforeAll( async () => {
			page = await browser.newPage();

			const testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );

			eventManager = new EditorTracksEventManager( page );
			editorPage = new EditorPage( page, { target: siteType } );
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
			it( 'Add pattern from sidebar inserter', async function () {
				await editorPage.addPattern( patternName );
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

		// TODO: Once we have better inline inserter support, add testing for inline inserter here.
	} );
} );
