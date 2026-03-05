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
			let editorContext: EditorContext;
			let publishedPostContext: PublishedPostContext;

			await test.step( 'Given I am authenticated', async () => {
				const testAccount = new TestAccount( accountName );
				await testAccount.authenticate( page );
			} );

			await test.step( 'When I visit the new post page', async () => {
				await pageEditor.visit( 'post' );
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
				await pageEditor.publish( { visit: true, timeout: 15 * 1000 } );
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
