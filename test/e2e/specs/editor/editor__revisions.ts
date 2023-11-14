/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	TestAccount,
	envVariables,
	EditorPage,
	RevisionsComponent,
	RevisionsPage,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

/**
 * This spec requires the following:
 * 	- theme: a non-block-based theme (eg. Twenty-Twenty One)
 */
describe( `Editor: Revisions`, function () {
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
		await testAccount.authenticateWpAdmin( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new EditorPage( page );
		await editorPage.visit( 'post' );
	} );

	it( 'Create revisions', async function () {
		await editorPage.enterText( 'Revision 1' );
		await editorPage.saveDraft();

		await editorPage.enterText( 'Revision 2' );
		await editorPage.saveDraft();

		await editorPage.enterText( 'Revision 3' );
		await editorPage.saveDraft();
	} );

	it( 'View revisions', async function () {
		await editorPage.openSettings();
		await editorPage.viewRevisions();
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
		} else {
			await revisionsComponent.loadSelectedRevision();
		}
	} );

	it( 'Validate loaded revision content', async function () {
		const postContent = await editorPage.getText();

		expect( postContent ).toBe( 'Revision 1' );
	} );
} );
