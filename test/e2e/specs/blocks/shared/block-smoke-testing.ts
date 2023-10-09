import {
	BlockFlow,
	EditorPage,
	EditorContext,
	PublishedPostContext,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	DataHelper,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Creates a suite of block smoke tests for a set of block flows.
 *
 * @param specName The parent name of the spec to use in the top-level describe. E.g. "CoBlocks"
 * @param blockFlows A list of block flows to put under test.
 */
export function createBlockTests( specName: string, blockFlows: BlockFlow[] ): void {
	describe( DataHelper.createSuiteTitle( specName ), function () {
		const features = envToFeatureKey( envVariables );
		// @todo Does it make sense to create a `simpleSitePersonalPlanUserEdge` with GB edge?
		// for now, it will pick up the default `gutenbergAtomicSiteEdgeUser` if edge is set.
		const accountName = getTestAccountByFeature( features, [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'simpleSitePersonalPlanUser',
			},
		] );

		let page: Page;
		let testAccount: TestAccount;
		let editorPage: EditorPage;
		let editorContext: EditorContext;
		let publishedPostContext: PublishedPostContext;

		beforeAll( async () => {
			page = await browser.newPage();
			editorPage = new EditorPage( page );
			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async () => {
			await editorPage.visit( 'post', {
				siteSlug: testAccount.getSiteURL( { protocol: false } ),
			} );
		} );

		it( 'Enter post title', async () => {
			await editorPage.enterTitle( `${ specName } - ${ DataHelper.getDateString( 'ISO-8601' ) }` );
		} );

		describe( 'Add and configure blocks in the editor', function () {
			for ( const blockFlow of blockFlows ) {
				it( `${ blockFlow.blockSidebarName }: Add the block from the sidebar`, async function () {
					const blockHandle = await editorPage.addBlockFromSidebar(
						blockFlow.blockSidebarName,
						blockFlow.blockEditorSelector,
						{ noSearch: true }
					);
					const id = await blockHandle.getAttribute( 'id' );
					const editorCanvas = await editorPage.getEditorCanvas();
					const addedBlockLocator = editorCanvas.locator( `#${ id }` );
					editorContext = {
						page,
						editorPage,
						addedBlockLocator,
					};
				} );

				it( `${ blockFlow.blockSidebarName }: Configure the block`, async function () {
					if ( blockFlow.configure ) {
						await blockFlow.configure( editorContext );
					}
				} );

				it( `${ blockFlow.blockSidebarName }: There are no block warnings or errors in the editor`, async function () {
					expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
				} );
			}
		} );

		describe( 'Publishing the post', function () {
			it( 'Publish and visit post', async function () {
				await editorPage.publish( { visit: true, timeout: 15 * 1000 } );
				publishedPostContext = {
					browser: browser,
					page: page,
				};
			} );
		} );

		describe( 'Validating blocks in published post.', function () {
			for ( const blockFlow of blockFlows ) {
				it( `${ blockFlow.blockSidebarName }: Expected content is in published post`, async function () {
					if ( blockFlow.validateAfterPublish ) {
						await blockFlow.validateAfterPublish( publishedPostContext );
					}
				} );
			}
		} );
	} );
}
