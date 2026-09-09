import {
	BlockFlow,
	DataHelper,
	EditorContext,
	PublishedPostContext,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { expect, tags as allTags, test } from '../../../lib/pw-base';

// Publishing a post carrying a synced form saves two entities. On Atomic the second save
// regularly outruns the cap that predates it, so only Atomic gets the longer one; Simple keeps
// the tighter bound, where it still catches a regression.
//
// 60s was not enough: the Jetpack Forms flows overran it on the private variation, where four
// workers share one site. Both values stay well inside the per-test budget set below.
//
// The tighter bound is 30s because publishing through the multi-entity save panel costs ~16s
// locally and ~19s on CI: two 5s waits on panels that never open, either side of the entity save
// and the publish itself.
const PUBLISH_TIMEOUT = 30 * 1000;
const ATOMIC_PUBLISH_TIMEOUT = 120 * 1000;

/**
 * Creates a suite of block smoke tests for a set of block flows.
 *
 * @param specName The parent name of the spec to use in the top-level describe. E.g. "CoBlocks"
 * @param blockFlows A list of block flows to put under test.
 * @param testTags Playwright tags to apply to the test suite. Defaults to [ tags.GUTENBERG ].
 */
export function createBlockTests(
	specName: string,
	blockFlows: BlockFlow[],
	testTags: string[] = [ allTags.GUTENBERG ]
): void {
	test.describe( DataHelper.createSuiteTitle( specName ), { tag: testTags }, () => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'simpleSitePersonalPlanUser',
			},
		] );

		test( `${ specName }: smoke test blocks`, async ( { page, pageEditor } ) => {
			// One test adds, configures and validates every flow in the list. The fixed cost —
			// authenticate, load the editor on Atomic, publish — dominates and is what overruns the
			// default, so most of the budget sits in the base and each flow adds a smaller share.
			test.setTimeout( 180_000 + blockFlows.length * 45_000 );

			let editorContext: EditorContext;
			let publishedPostContext: PublishedPostContext;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I visit the new post page', async () => {
				const siteSlug = new TestAccount( accountName ).getSiteURL( { protocol: false } );
				await pageEditor.visit( 'post', { siteSlug } );
			} );

			await test.step( 'When I enter the post title', async () => {
				await pageEditor.enterTitle(
					`${ specName } - ${ DataHelper.getDateString( 'ISO-8601' ) }`
				);
			} );

			for ( const blockFlow of blockFlows ) {
				const prefix = blockFlow.blockTestName ?? blockFlow.blockSidebarName;

				await test.step( `${ prefix }: Add the block from the sidebar`, async () => {
					const blockHandle = await pageEditor.addBlockFromSidebar(
						blockFlow.blockSidebarName,
						blockFlow.blockEditorSelector,
						{
							noSearch: blockFlow.noSearch === false ? false : true,
							blockFallBackName: blockFlow.blockTestFallBackName,
							blockInsertedPopupConfirmButtonSelector:
								blockFlow.blockInsertedPopupConfirmButtonSelector,
						}
					);
					const id = await blockHandle.getAttribute( 'id' );
					const editorCanvas = await pageEditor.getEditorCanvas();
					const addedBlockLocator = editorCanvas.locator( `#${ id }` );
					editorContext = {
						page,
						editorPage: pageEditor,
						addedBlockLocator,
					};
				} );

				await test.step( `${ prefix }: Configure the block`, async () => {
					if ( blockFlow.configure ) {
						await blockFlow.configure( editorContext );
					}
				} );

				await test.step( `${ prefix }: There are no block warnings or errors in the editor`, async () => {
					expect( await pageEditor.editorHasBlockWarnings() ).toBe( false );
				} );
			}

			await test.step( 'When I publish and visit the post', async () => {
				await pageEditor.publish( {
					visit: true,
					timeout: envVariables.TEST_ON_ATOMIC ? ATOMIC_PUBLISH_TIMEOUT : PUBLISH_TIMEOUT,
				} );
				publishedPostContext = {
					browser: page.context().browser()!,
					page,
				};
			} );

			for ( const blockFlow of blockFlows ) {
				const prefix = blockFlow.blockTestName ?? blockFlow.blockSidebarName;

				await test.step( `${ prefix }: Expected content is in published post`, async () => {
					if ( blockFlow.validateAfterPublish ) {
						await blockFlow.validateAfterPublish( publishedPostContext );
					}
				} );
			}
		} );
	} );
}
