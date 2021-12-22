/**
 * @group gutenberg
 */

import {
	DataHelper,
	BrowserHelper,
	TestAccount,
	GutenbergEditorPage,
	EditorSettingsSidebarComponent,
	RevisionsComponent,
	setupHooks,
	ParagraphBlock,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( `Editor: Revisions` ), function () {
	const accountName = BrowserHelper.targetGutenbergEdge()
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	let gutenbergEditorPage: GutenbergEditorPage;
	let editorSettingsSidebarComponent: EditorSettingsSidebarComponent;
	let page: Page;

	setupHooks( async ( args ) => {
		page = args.page;
		gutenbergEditorPage = new GutenbergEditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		await gutenbergEditorPage.visit( 'post' );
	} );

	it( 'Enter post title', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.enterTitle( DataHelper.getRandomPhrase() );
		await gutenbergEditorPage.saveDraft();
	} );

	it.each( [ { revision: 1 }, { revision: 2 } ] )(
		'Create revision $revision',
		async function ( { revision } ) {
			const blockHandle = await gutenbergEditorPage.addBlock(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( `Revision ${ revision }` );
			await gutenbergEditorPage.saveDraft();
		}
	);

	it( 'View revisions', async function () {
		const frame = await gutenbergEditorPage.getEditorFrame();
		await gutenbergEditorPage.openSettings();
		editorSettingsSidebarComponent = new EditorSettingsSidebarComponent( frame, page );
		await editorSettingsSidebarComponent.clickTab( 'Post' );
		await editorSettingsSidebarComponent.showRevisions();
	} );

	it( 'Restore revision 1', async function () {
		const revisionsComponent = new RevisionsComponent( page );
		await revisionsComponent.selectRevision( 1 );
		await revisionsComponent.clickButton( 'Load' );
		const text = await gutenbergEditorPage.getText();
		expect( text ).toEqual( '' );
	} );
} );
