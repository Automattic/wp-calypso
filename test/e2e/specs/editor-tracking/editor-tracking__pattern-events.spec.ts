import {
	DataHelper,
	EditorPage,
	EditorTracksEventManager,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe.fixme(
	DataHelper.createSuiteTitle( 'Editor tracking: Pattern-related events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features );

		test( '"wpcom_pattern_inserted" event fires from sidebar and inline inserters', async ( {
			page,
			pageEditor,
		} ) => {
			let editorTracksEventManager: EditorTracksEventManager;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
				editorTracksEventManager = new EditorTracksEventManager( page );
			} );

			await test.step( 'When I start a new page', async () => {
				await pageEditor.visit( 'page' );
				await pageEditor.waitUntilLoaded();
			} );

			// From the sidebar inserter
			const sidebarPatternName = 'Simple Two Column Layout';
			const sidebarPatternNameInEventProperty = 'a8c/simple-two-column-layout';

			await test.step( `When I add pattern "${ sidebarPatternName }" from sidebar inserter`, async () => {
				await pageEditor.addPatternFromSidebar( sidebarPatternName );
			} );

			await test.step( `Then "wpcom_pattern_inserted" event fires with "pattern_name" === "${ sidebarPatternNameInEventProperty }"`, async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_pattern_inserted',
					{
						matchingProperties: {
							pattern_name: sidebarPatternNameInEventProperty,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			// From the inline inserter
			const inlinePatternName = 'About Me Card';
			const inlinePatternNameInEventProperty = 'a8c/about-me-card';

			await test.step( 'When I clear event stack for clean slate', async () => {
				await editorTracksEventManager!.clearEvents();
			} );

			await test.step( `When I add pattern "${ inlinePatternName }" from inline inserter`, async () => {
				const editorCanvas = await pageEditor.getEditorCanvas();
				const inserterLocator = editorCanvas.locator( 'button[aria-label="Add block"]' );
				await pageEditor.addPatternInline( inlinePatternName, inserterLocator );
			} );

			await test.step( `Then "wpcom_pattern_inserted" event fires with "pattern_name" === "${ inlinePatternNameInEventProperty }"`, async () => {
				const eventDidFire = await editorTracksEventManager!.didEventFire(
					'wpcom_pattern_inserted',
					{
						matchingProperties: {
							pattern_name: inlinePatternNameInEventProperty,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			void EditorPage;
		} );
	}
);
