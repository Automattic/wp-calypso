import {
	DataHelper,
	BlockFlow,
	setupHooks,
	GutenbergEditorPage,
	LoginFlow,
	NewPostFlow,
	EditorContext,
	PublishedPostContext,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

/**
 * Creates a suite of block smoke tests for a set of block flows.
 *
 * @param specName The parent name of the spec to use in the top-level describe. E.g. "CoBlocks"
 * @param blockFlows A list of block flows to put under test.
 */
export function createBlockTests( specName: string, blockFlows: BlockFlow[] ): void {
	describe( DataHelper.createSuiteTitle( specName ), function () {
		let page: Page;
		let gutenbergEditorPage: GutenbergEditorPage;
		let editorContext: EditorContext;
		let publishedPostContext: PublishedPostContext;

		setupHooks( ( args ) => {
			page = args.page;
		} );

		describe( 'Editor set up', function () {
			it( 'Log in and start a new post', async function () {
				const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' );
				await loginFlow.logIn();

				const newPostFlow = new NewPostFlow( page );
				await newPostFlow.newPostFromNavbar();

				gutenbergEditorPage = new GutenbergEditorPage( page );
				const title = DataHelper.getRandomPhrase();
				await gutenbergEditorPage.enterTitle( title );
				await gutenbergEditorPage.dismissWelcomeTourIfPresent();
			} );
		} );

		describe( 'Add and configure blocks in the editor:', function () {
			for ( const blockFlow of blockFlows ) {
				describe( blockFlow.blockSidebarName, function () {
					it( 'Add the block from the sidebar', async function () {
						const blockHandle = await gutenbergEditorPage.addBlock(
							blockFlow.blockSidebarName,
							blockFlow.blockEditorSelector
						);
						editorContext = {
							page: page,
							editorIframe: await gutenbergEditorPage.getEditorFrame(),
							blockHandle: blockHandle,
						};
					} );

					it( 'Configure the block', async function () {
						await blockFlow.configure( editorContext );
					} );

					it( 'There are no block warnings or errors in the editor', async function () {
						expect( await gutenbergEditorPage.editorHasBlockWarnings() ).toBe( false );
					} );
				} );
			}
		} );

		describe( 'Publishing and validation', function () {
			it( 'Publish and visit post', async function () {
				await gutenbergEditorPage.publish( { visit: true } );
				publishedPostContext = {
					page: page,
				};
			} );

			describe( 'Blocks have expected output in published post:', function () {
				for ( const blockFlow of blockFlows ) {
					it( blockFlow.blockSidebarName, async function () {
						await blockFlow.validateAfterPublish( publishedPostContext );
					} );
				}
			} );
		} );
	} );
}
