import {
	DataHelper,
	EditorTracksEventManager,
	TestAccount,
	envToFeatureKey,
	envVariables,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Editor tracking: Pattern-related events' ),
	{ tag: [ tags.EDITOR_TRACKING ] },
	() => {
		const features = envToFeatureKey( envVariables );

		test( '"wpcom_pattern_inserted" event fires from sidebar and inline inserters', async ( {
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

			await test.step( 'When I start a new page', async () => {
				await pageEditor.visit( 'page', { siteSlug } );
				await pageEditor.waitUntilLoaded();
			} );

			// Both inserters use the same a8c pattern; "pattern_name" in the
			// Tracks event is the pattern slug.
			const patternName = 'About: Profile';
			const patternNameInEventProperty = 'a8c/about-profile';

			// From the inline inserter. It is only rendered while an empty default
			// block is selected, so the canvas is clicked first, and it is rendered
			// as a popover in the editor parent rather than inside the canvas.
			await test.step( `When I add pattern "${ patternName }" from inline inserter`, async () => {
				const editorCanvas = await pageEditor.getEditorCanvas();
				await editorCanvas
					.locator( 'p[data-title="Paragraph"][data-empty="true"]' )
					.first()
					.click();

				const editorParent = await pageEditor.getEditorParent();
				const inserterLocator = editorParent.locator(
					'.block-editor-block-list__empty-block-inserter button[aria-label="Add block"]'
				);
				await pageEditor.addPatternInline( patternName, inserterLocator );
			} );

			await test.step( `Then "wpcom_pattern_inserted" event fires with "pattern_name" === "${ patternNameInEventProperty }"`, async () => {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_pattern_inserted',
					{
						matchingProperties: {
							pattern_name: patternNameInEventProperty,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );

			await test.step( 'When I clear event stack for clean slate', async () => {
				await editorTracksEventManager.clearEvents();
			} );

			// From the sidebar inserter
			await test.step( `When I add pattern "${ patternName }" from sidebar inserter`, async () => {
				await pageEditor.addPatternFromSidebar( patternName );
			} );

			await test.step( `Then "wpcom_pattern_inserted" event fires with "pattern_name" === "${ patternNameInEventProperty }"`, async () => {
				const eventDidFire = await editorTracksEventManager.didEventFire(
					'wpcom_pattern_inserted',
					{
						matchingProperties: {
							pattern_name: patternNameInEventProperty,
						},
					}
				);
				expect( eventDidFire ).toBe( true );
			} );
		} );
	}
);
