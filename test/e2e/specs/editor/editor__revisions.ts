/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	GutenbergEditorPage,
	RevisionsComponent,
	ParagraphBlock,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Revisions` ), function () {
	const accountName = envVariables.GUTENBERG_EDGE
		? 'gutenbergSimpleSiteEdgeUser'
		: 'simpleSitePersonalPlanUser';
	let gutenbergEditorPage: GutenbergEditorPage;
	let revisionsComponent: RevisionsComponent;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		gutenbergEditorPage = new GutenbergEditorPage( page );
		await gutenbergEditorPage.visit( 'post' );
	} );

	it.each( [ { revision: 1 }, { revision: 2 }, { revision: 3 } ] )(
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
		await gutenbergEditorPage.openSettings();
		await gutenbergEditorPage.viewRevisions();
	} );

	it( 'Revision 1 displays expected diff', async function () {
		revisionsComponent = new RevisionsComponent( page );
		await revisionsComponent.selectRevision( 1 );
		await revisionsComponent.validateTextInRevision( 'Revision 1' );
	} );

	it( 'Restore revision 1', async function () {
		revisionsComponent = new RevisionsComponent( page );
		await revisionsComponent.clickButton( 'Load' );

		const text = await gutenbergEditorPage.getText();
		expect( text ).toEqual( 'Revision 1' );
	} );
} );
