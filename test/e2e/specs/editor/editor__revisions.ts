/**
 * @group gutenberg
 * @group calypso-pr
 */

import {
	TestAccount,
	envVariables,
	EditorPage,
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
	let revisionsPage: RevisionsPage;
	let page: Page;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Go to the new post page', async function () {
		editorPage = new EditorPage( page, { target: features.siteType } );
		await editorPage.visit( testAccount.getSiteURL( { protocol: true } ), 'post' );
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

		// Revisions are opened on a dedicated page, e.g.
		// https://yourblog.wpcomstaging.com/wp-admin/revision.php?revision=123
		await Promise.all( [ page.waitForNavigation(), editorPage.viewRevisions() ] );
	} );

	it( 'Select first revision', async function () {
		revisionsPage = new RevisionsPage( page );
		await revisionsPage.selectRevision( 1 );
	} );

	it( 'Validate selected revision diff', async function () {
		const revisionContent = await page.innerText( '.revisions-diff' );

		expect( revisionContent ).toContain( 'Revision 1' );
		expect( revisionContent ).not.toContain( 'Revision 2' );
		expect( revisionContent ).not.toContain( 'Revision 3' );
	} );

	it( 'Load selected revision', async function () {
		await revisionsPage.loadSelectedRevision();
	} );

	it( 'Validate loaded revision content', async function () {
		const postContent = await editorPage.getText();

		expect( postContent ).toBe( 'Revision 1' );
	} );
} );
