/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	EditorPage,
	RevisionsComponent,
	RevisionsPage,
	ParagraphBlock,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( `Editor: Revisions` ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features, [
		{ gutenberg: 'stable', siteType: 'simple', accountName: 'simpleSitePersonalPlanUser' },
	] );

	let editorPage: EditorPage;
	let revisionsComponent: RevisionsComponent;
	let revisionsPage: RevisionsPage;
	let page: Page;

	beforeAll( async function () {
		page = await browser.newPage();

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new EditorPage( page, { target: features.siteType } );
		await editorPage.visit( 'post' );
	} );

	it.each( [ { revision: 1 }, { revision: 2 }, { revision: 3 } ] )(
		'Create revision $revision',
		async function ( { revision } ) {
			const blockHandle = await editorPage.addBlockFromSidebar(
				ParagraphBlock.blockName,
				ParagraphBlock.blockEditorSelector
			);
			const paragraphBlock = new ParagraphBlock( blockHandle );
			await paragraphBlock.enterParagraph( `Revision ${ revision }` );
			await editorPage.saveDraft();
		}
	);

	it( 'View revisions', async function () {
		await editorPage.openSettings();

		if ( envVariables.TEST_ON_ATOMIC ) {
			// Revisions are opened on a dedicated page on Atomic sites, e.g.
			// https://yourblog.wpcomstaging.com/wp-admin/revision.php?revision=123
			await Promise.all( [ page.waitForNavigation(), editorPage.viewRevisions() ] );
		} else {
			await editorPage.viewRevisions();
		}
	} );

	it( 'Select first revision', async function () {
		if ( envVariables.TEST_ON_ATOMIC ) {
			revisionsPage = new RevisionsPage( page );
			await revisionsPage.selectRevision( 1 );
		} else {
			revisionsComponent = new RevisionsComponent( page );
			await revisionsComponent.selectRevision( 1 );
		}
	} );

	it( 'Validate selected revision diff', async function () {
		let revisionContent: string;

		if ( envVariables.TEST_ON_ATOMIC ) {
			revisionContent = await page.innerText( '.revisions-diff' );
		} else {
			revisionContent = await page.innerText( '.editor-diff-viewer__content' );
		}

		expect( revisionContent ).toContain( 'Revision 1' );
		expect( revisionContent ).not.toContain( 'Revision 2' );
		expect( revisionContent ).not.toContain( 'Revision 3' );
	} );

	it( 'Load selected revision', async function () {
		if ( envVariables.TEST_ON_ATOMIC ) {
			await revisionsPage.loadSelectedRevision();
			await editorPage.waitUntilLoaded();
		} else {
			await revisionsComponent.loadSelectedRevision();
		}
	} );

	it( 'Validate loaded revision content', async function () {
		const postContent = await editorPage.getText();

		expect( postContent ).toBe( 'Revision 1' );
	} );
} );
